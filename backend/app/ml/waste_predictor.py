from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import ConsumptionHistory, InventoryItem, Category
from app.schemas.analytics import WasteRiskPredictionItem, WasteRiskPredictionOut

class WastePredictor:
    """
    ML/Statistical Food Waste Risk Engine.
    Follows strict rule: Never claims an ML prediction is accurate when there is insufficient historical data.
    """
    MIN_REQUIRED_DATA_POINTS = 3

    @classmethod
    def predict_user_waste_risks(cls, db: Session, user_id: int) -> WasteRiskPredictionOut:
        # Get active inventory items
        active_items = db.query(InventoryItem).filter(
            InventoryItem.user_id == user_id,
            InventoryItem.quantity > 0
        ).all()

        # Query historical consumption and waste logs for this user
        history_records = db.query(ConsumptionHistory).filter(
            ConsumptionHistory.user_id == user_id
        ).all()

        # Aggregate historical data by food_name and category
        food_stats: Dict[str, Dict[str, Any]] = {}
        for h in history_records:
            name_key = h.food_name.strip().lower()
            if name_key not in food_stats:
                food_stats[name_key] = {
                    "total_entries": 0,
                    "wasted_entries": 0,
                    "consumed_entries": 0,
                    "total_quantity_wasted": 0.0,
                    "total_quantity_consumed": 0.0,
                    "category": h.category_name or "General"
                }
            food_stats[name_key]["total_entries"] += 1
            if h.action in ["expired", "wasted"]:
                food_stats[name_key]["wasted_entries"] += 1
                food_stats[name_key]["total_quantity_wasted"] += h.quantity
            elif h.action == "consumed":
                food_stats[name_key]["consumed_entries"] += 1
                food_stats[name_key]["total_quantity_consumed"] += h.quantity

        predictions: List[WasteRiskPredictionItem] = []
        high_risk_count = 0

        for item in active_items:
            name_key = item.food_name.strip().lower()
            cat_name = item.category.name if item.category else "Uncategorized"
            stats = food_stats.get(name_key)

            if not stats or stats["total_entries"] < cls.MIN_REQUIRED_DATA_POINTS:
                # Insufficient historical data
                predictions.append(
                    WasteRiskPredictionItem(
                        food_name=item.food_name,
                        category_name=cat_name,
                        risk_level="Moderate" if item.status in ["Critical", "Expiring Soon"] else "Low",
                        confidence_score=0.2,
                        predicted_waste_probability=0.25 if item.status == "Expiring Soon" else 0.1,
                        recommendation="Insufficient historical consumption logs. Continue logging meals to generate personalized ML waste predictions.",
                        has_sufficient_data=False,
                        data_points_count=stats["total_entries"] if stats else 0
                    )
                )
            else:
                total_events = stats["total_entries"]
                waste_events = stats["wasted_entries"]
                historical_waste_rate = waste_events / total_events

                # Factor in current item urgency
                urgency_factor = 0.0
                if item.status == "Critical":
                    urgency_factor = 0.4
                elif item.status == "Expiring Soon":
                    urgency_factor = 0.25

                waste_prob = min(0.95, round(historical_waste_rate * 0.7 + urgency_factor, 2))
                confidence = min(0.95, round(0.5 + (total_events * 0.08), 2))

                if waste_prob >= 0.6:
                    risk_level = "High"
                    high_risk_count += 1
                    recommendation = f"High historical waste risk ({int(historical_waste_rate*100)}%). Prioritize in a recipe today or consider freezing."
                elif waste_prob >= 0.35:
                    risk_level = "Moderate"
                    recommendation = f"Moderate waste pattern. Consider preparing smaller portion sizes or batch cooking."
                else:
                    risk_level = "Low"
                    recommendation = "Healthy consumption pattern. You consistently consume this item before it spoils."

                predictions.append(
                    WasteRiskPredictionItem(
                        food_name=item.food_name,
                        category_name=cat_name,
                        risk_level=risk_level,
                        confidence_score=confidence,
                        predicted_waste_probability=waste_prob,
                        recommendation=recommendation,
                        has_sufficient_data=True,
                        data_points_count=total_events
                    )
                )

        overall_risk = "Low"
        if high_risk_count >= 2:
            overall_risk = "High"
        elif high_risk_count == 1:
            overall_risk = "Moderate"

        return WasteRiskPredictionOut(
            items=predictions,
            model_version="SmartKitchen-WasteRisk-v1.0",
            overall_kitchen_risk=overall_risk
        )
