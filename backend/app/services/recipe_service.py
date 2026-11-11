from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.models import Recipe, InventoryItem, Leftover
from app.schemas.recipe import (
    RecipeRecommendationOut,
    RecipeOut,
    RecipeIngredientOut,
    CookRecipeResponse,
    CookedIngredientResult,
)
from app.ml.recipe_scorer import RecipeScorer
from app.services.inventory_service import InventoryService

class RecipeService:
    @staticmethod
    def get_recipes(
        db: Session,
        cuisine: Optional[str] = None,
        difficulty: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Recipe]:
        query = db.query(Recipe)
        if cuisine:
            query = query.filter(Recipe.cuisine.ilike(f"%{cuisine}%"))
        if difficulty:
            query = query.filter(Recipe.difficulty.ilike(difficulty))
        if search:
            query = query.filter(Recipe.title.ilike(f"%{search}%"))
        return query.all()

    @staticmethod
    def get_recipe_by_id(db: Session, recipe_id: int) -> Optional[Recipe]:
        return db.query(Recipe).filter(Recipe.id == recipe_id).first()

    @staticmethod
    def recommend_recipes(
        db: Session,
        user_id: int,
        limit: int = 10,
        min_score: float = 0.0
    ) -> List[RecipeRecommendationOut]:
        # 1. Fetch user active inventory items
        user_items = db.query(InventoryItem).filter(
            InventoryItem.user_id == user_id,
            InventoryItem.quantity > 0
        ).all()

        # 2. Fetch user leftovers
        user_leftovers = db.query(Leftover).filter(
            Leftover.user_id == user_id,
            Leftover.is_consumed == False
        ).all()

        # 3. Fetch all recipes with ingredients
        all_recipes = db.query(Recipe).all()

        scored_recommendations: List[RecipeRecommendationOut] = []

        # Create quick inventory name set for ingredient highlighting
        inv_name_set = {item.food_name.strip().lower() for item in user_items}
        expiring_name_set = {item.food_name.strip().lower() for item in user_items if item.status in ["Critical", "Expiring Soon"]}

        for recipe in all_recipes:
            eval_result = RecipeScorer.evaluate_recipe(recipe, user_items, user_leftovers)

            if eval_result["recommendation_score"] >= min_score or eval_result["match_percentage"] > 0:
                # Prepare enriched ingredient list
                enriched_ingredients = []
                for ing in recipe.ingredients:
                    ing_key = ing.ingredient_name.strip().lower()
                    is_avail = any(k in ing_key or ing_key in k for k in inv_name_set)
                    is_expiring = any(k in ing_key or ing_key in k for k in expiring_name_set)

                    enriched_ingredients.append(
                        RecipeIngredientOut(
                            id=ing.id,
                            ingredient_name=ing.ingredient_name,
                            quantity=ing.quantity,
                            unit=ing.unit,
                            is_optional=ing.is_optional,
                            is_available=is_avail,
                            is_expiring_soon=is_expiring
                        )
                    )

                rec_out = RecipeRecommendationOut(
                    id=recipe.id,
                    title=recipe.title,
                    description=recipe.description,
                    cuisine=recipe.cuisine,
                    prep_time_minutes=recipe.prep_time_minutes,
                    cook_time_minutes=recipe.cook_time_minutes,
                    difficulty=recipe.difficulty,
                    instructions=recipe.instructions,
                    image_url=recipe.image_url,
                    calories=recipe.calories,
                    protein_g=recipe.protein_g,
                    carbs_g=recipe.carbs_g,
                    fat_g=recipe.fat_g,
                    servings=recipe.servings,
                    ingredients=enriched_ingredients,
                    match_percentage=eval_result["match_percentage"],
                    matched_ingredients=eval_result["matched_ingredients"],
                    missing_ingredients=eval_result["missing_ingredients"],
                    expiring_ingredients_used=eval_result["expiring_ingredients_used"],
                    leftovers_used=eval_result["leftovers_used"],
                    recommendation_score=eval_result["recommendation_score"],
                    recommendation_reason=eval_result["recommendation_reason"]
                )
                scored_recommendations.append(rec_out)

        # Sort by recommendation score descending
        scored_recommendations.sort(key=lambda x: x.recommendation_score, reverse=True)
        return scored_recommendations[:limit]

    @staticmethod
    def _normalize_unit(unit: Optional[str]) -> str:
        u = (unit or "").strip().lower()
        aliases = {
            "g": "g", "gram": "g", "grams": "g",
            "kg": "kg", "kilogram": "kg", "kilograms": "kg",
            "oz": "oz", "ounce": "oz", "ounces": "oz",
            "lb": "lb", "lbs": "lb", "pound": "lb", "pounds": "lb",
            "ml": "ml", "milliliter": "ml", "milliliters": "ml",
            "l": "l", "liter": "l", "liters": "l", "litre": "l", "litres": "l",
            "tbsp": "tbsp", "tablespoon": "tbsp", "tablespoons": "tbsp",
            "tsp": "tsp", "teaspoon": "tsp", "teaspoons": "tsp",
            "cup": "cup", "cups": "cup",
            "piece": "count", "pieces": "count", "pc": "count", "pcs": "count",
            "unit": "count", "units": "count", "whole": "count", "clove": "count",
            "cloves": "count", "slice": "count", "slices": "count",
            "egg": "count", "eggs": "count",
        }
        return aliases.get(u, u)

    @classmethod
    def _convert_quantity(
        cls,
        qty: Optional[float],
        from_unit: Optional[str],
        to_unit: Optional[str],
        available_qty: float,
    ) -> float:
        needed = qty if (qty is not None and qty > 0) else 1.0
        fu = cls._normalize_unit(from_unit)
        tu = cls._normalize_unit(to_unit)

        if fu == tu or not fu or not tu:
            return round(min(needed, available_qty), 2)

        weight_to_g = {"g": 1.0, "kg": 1000.0, "oz": 28.3495, "lb": 453.592}
        if fu in weight_to_g and tu in weight_to_g:
            converted = (needed * weight_to_g[fu]) / weight_to_g[tu]
            return round(min(converted, available_qty), 2)

        vol_to_ml = {"ml": 1.0, "l": 1000.0, "tbsp": 15.0, "tsp": 5.0, "cup": 240.0}
        if fu in vol_to_ml and tu in vol_to_ml:
            converted = (needed * vol_to_ml[fu]) / vol_to_ml[tu]
            return round(min(converted, available_qty), 2)

        # Incompatible units (e.g. "200 g" recipe vs "2 bottles" inventory): deduct 1 unit safely
        if needed > available_qty:
            return round(min(1.0, available_qty), 2)
        return round(min(needed, available_qty), 2)

    @classmethod
    def cook_recipe(
        cls,
        db: Session,
        user_id: int,
        recipe_id: int,
        ingredient_ids: Optional[List[int]] = None,
    ) -> Optional[CookRecipeResponse]:
        recipe = cls.get_recipe_by_id(db, recipe_id)
        if not recipe:
            return None

        # Fetch active inventory sorted by earliest expiry first (FIFO)
        user_items = (
            db.query(InventoryItem)
            .filter(InventoryItem.user_id == user_id, InventoryItem.quantity > 0)
            .all()
        )
        user_items.sort(key=lambda x: (x.expiry_date is None, x.expiry_date or date.max))

        selected_set = set(ingredient_ids) if ingredient_ids is not None else None
        consumed_results: List[CookedIngredientResult] = []

        for ing in recipe.ingredients:
            if selected_set is not None and ing.id not in selected_set:
                continue

            ing_name = ing.ingredient_name.strip().lower()
            matching_items = [
                it
                for it in user_items
                if it.quantity > 0
                and (
                    it.food_name.strip().lower() in ing_name
                    or ing_name in it.food_name.strip().lower()
                )
            ]
            if not matching_items:
                continue

            # Deduct across matching FIFO batches until the recipe quantity is satisfied
            remaining_to_deduct = ing.quantity if (ing.quantity is not None and ing.quantity > 0) else 1.0
            for item in matching_items:
                if item.quantity <= 0 or remaining_to_deduct <= 0:
                    continue

                deduct_qty = cls._convert_quantity(
                    remaining_to_deduct,
                    ing.unit,
                    item.unit,
                    item.quantity,
                )
                if deduct_qty <= 0:
                    continue

                prev_qty = item.quantity
                updated = InventoryService.consume_item(
                    db=db,
                    user_id=user_id,
                    item_id=item.id,
                    quantity=deduct_qty,
                    action="consumed",
                )
                if not updated:
                    continue

                actual_deducted = round(prev_qty - updated.quantity, 2)
                consumed_results.append(
                    CookedIngredientResult(
                        inventory_item_id=item.id,
                        food_name=item.food_name,
                        deducted_quantity=actual_deducted,
                        remaining_quantity=round(updated.quantity, 2),
                        unit=item.unit,
                        fully_consumed=updated.quantity <= 0,
                    )
                )

                # Reduce remaining_to_deduct proportionally; if units differed, stop after 1 batch
                if cls._normalize_unit(ing.unit) == cls._normalize_unit(item.unit):
                    remaining_to_deduct = round(max(0.0, remaining_to_deduct - actual_deducted), 2)
                else:
                    remaining_to_deduct = 0.0

        count = len(consumed_results)
        msg = (
            f"Marked {count} ingredient{'s' if count != 1 else ''} as consumed from your inventory."
            if count > 0
            else "No matching inventory items needed deduction."
        )
        return CookRecipeResponse(
            recipe_id=recipe.id,
            recipe_title=recipe.title,
            consumed_items=consumed_results,
            message=msg,
        )
