from typing import List, Dict, Any, Tuple
from datetime import date
from app.models.models import Recipe, InventoryItem, Leftover

class RecipeScorer:
    """
    Mathematical recipe scoring engine:
    Recipe Score = (Base Match % * 0.5) + Expiry Urgency Score + Leftover Score - Missing Penalty
    """
    @classmethod
    def evaluate_recipe(
        cls,
        recipe: Recipe,
        inventory_items: List[InventoryItem],
        leftovers: List[Leftover]
    ) -> Dict[str, Any]:
        today = date.today()
        # Build normalized inventory lookup: name -> {days_left, item}
        inv_map: Dict[str, Dict[str, Any]] = {}
        for item in inventory_items:
            if item.quantity <= 0:
                continue
            name_key = item.food_name.strip().lower()
            days_left = (item.expiry_date - today).days if item.expiry_date else 999
            inv_map[name_key] = {
                "days_left": days_left,
                "item": item
            }

        leftover_names = [l.name.strip().lower() for l in leftovers if not l.is_consumed]

        matched_ingredients = []
        missing_ingredients = []
        expiring_used = []
        leftovers_used = []

        total_required = 0
        total_matched = 0
        expiry_score = 0.0

        for r_ing in recipe.ingredients:
            ing_name = r_ing.ingredient_name.strip()
            ing_key = ing_name.lower()

            if not r_ing.is_optional:
                total_required += 1

            # Match check: exact substring or token match
            matched = False
            for user_item_name, data in inv_map.items():
                if (user_item_name in ing_key) or (ing_key in user_item_name):
                    matched = True
                    matched_ingredients.append(ing_name)
                    if not r_ing.is_optional:
                        total_matched += 1

                    # Check urgency
                    days = data["days_left"]
                    if days <= 1:
                        expiry_score += 25.0
                        expiring_used.append(f"{ing_name} (expires in {max(0, days)}d)")
                    elif days <= 3:
                        expiry_score += 15.0
                        expiring_used.append(f"{ing_name} (expires in {days}d)")
                    break

            if not matched:
                # Check if matches any leftover
                for lo_name in leftover_names:
                    if (lo_name in ing_key) or (ing_key in lo_name):
                        matched = True
                        matched_ingredients.append(f"{ing_name} (from Leftover: {lo_name})")
                        leftovers_used.append(lo_name)
                        if not r_ing.is_optional:
                            total_matched += 1
                        break

            if not matched and not r_ing.is_optional:
                missing_ingredients.append(ing_name)

        # Calculations
        req_count = max(1, total_required)
        match_percentage = round((total_matched / req_count) * 100.0, 1)

        # Leftover boost
        leftover_score = len(leftovers_used) * 15.0

        # Missing ingredient penalty
        missing_penalty = len(missing_ingredients) * 8.0

        # Composite score
        raw_score = (match_percentage * 0.55) + expiry_score + leftover_score - missing_penalty
        final_score = round(min(100.0, max(0.0, raw_score)), 1)

        # Generate intelligent, transparent reason
        reasons = []
        if expiring_used:
            reasons.append(f"Uses {len(expiring_used)} ingredient{'s' if len(expiring_used) > 1 else ''} approaching expiry: {', '.join(expiring_used)}.")
        if leftovers_used:
            reasons.append(f"Great way to repurpose leftovers: {', '.join(leftovers_used)}.")
        if match_percentage >= 90.0:
            reasons.append("You already have almost all the required ingredients!")
        elif match_percentage >= 60.0:
            reasons.append(f"You have {int(match_percentage)}% of ingredients on hand.")
        elif not reasons:
            reasons.append(f"Requires {len(missing_ingredients)} additional ingredient{'s' if len(missing_ingredients) > 1 else ''}.")

        recommendation_reason = " ".join(reasons)

        return {
            "match_percentage": match_percentage,
            "matched_ingredients": matched_ingredients,
            "missing_ingredients": missing_ingredients,
            "expiring_ingredients_used": expiring_used,
            "leftovers_used": leftovers_used,
            "recommendation_score": final_score,
            "recommendation_reason": recommendation_reason
        }
