from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Recipe, InventoryItem, Leftover
from app.schemas.recipe import RecipeRecommendationOut, RecipeOut, RecipeIngredientOut
from app.ml.recipe_scorer import RecipeScorer

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
