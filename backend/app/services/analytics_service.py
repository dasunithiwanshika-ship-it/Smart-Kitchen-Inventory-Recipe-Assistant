from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.models import ConsumptionHistory, InventoryItem
from app.schemas.analytics import FoodWasteAnalyticsOut, CategoryWasteItem

class AnalyticsService:
    @staticmethod
    def get_waste_analytics(db: Session, user_id: int, days: int = 30) -> FoodWasteAnalyticsOut:
        since_date = datetime.utcnow() - timedelta(days=days)

        records = db.query(ConsumptionHistory).filter(
            ConsumptionHistory.user_id == user_id,
            ConsumptionHistory.recorded_at >= since_date
        ).all()

        total_consumed = len([r for r in records if r.action == "consumed"])
        total_expired = len([r for r in records if r.action == "expired"])
        total_wasted = len([r for r in records if r.action == "wasted"])

        total_waste_events = total_expired + total_wasted
        total_events = len(records)
        waste_rate = round((total_waste_events / total_events * 100.0), 1) if total_events > 0 else 0.0

        # Group by food_name to find most wasted
        waste_by_food: Dict[str, Dict[str, Any]] = {}
        waste_by_category: Dict[str, Dict[str, Any]] = {}

        for r in records:
            if r.action in ["expired", "wasted"]:
                # Food aggregation
                if r.food_name not in waste_by_food:
                    waste_by_food[r.food_name] = {"count": 0, "quantity": 0.0, "unit": r.unit}
                waste_by_food[r.food_name]["count"] += 1
                waste_by_food[r.food_name]["quantity"] += r.quantity

                # Category aggregation
                cat = r.category_name or "Other"
                if cat not in waste_by_category:
                    waste_by_category[cat] = {"count": 0, "quantity": 0.0}
                waste_by_category[cat]["count"] += 1
                waste_by_category[cat]["quantity"] += r.quantity

        # Format most wasted items
        sorted_foods = sorted(waste_by_food.items(), key=lambda x: x[1]["count"], reverse=True)
        most_wasted = [
            {
                "food_name": item[0],
                "quantity": f"{round(item[1]['quantity'], 1)} {item[1]['unit']}",
                "wasted_times": str(item[1]["count"])
            }
            for item in sorted_foods[:5]
        ]

        # Category breakdown
        category_breakdown = []
        total_waste_qty = sum(v["quantity"] for v in waste_by_category.values()) or 1.0

        for cat_name, val in waste_by_category.items():
            category_breakdown.append(
                CategoryWasteItem(
                    category_name=cat_name,
                    wasted_count=val["count"],
                    wasted_quantity_approx_kg=round(val["quantity"] * 0.4, 2), # normalized approx
                    percentage_of_total_waste=round((val["quantity"] / total_waste_qty) * 100.0, 1)
                )
            )

        # Money saved estimation ($3.50 average per meal saved from expiry)
        money_saved = round(total_consumed * 2.80, 2)

        return FoodWasteAnalyticsOut(
            timeframe=f"Last {days} Days",
            total_consumed_items=total_consumed,
            total_expired_items=total_expired,
            total_wasted_items=total_wasted,
            waste_rate_percentage=waste_rate,
            most_wasted_items=most_wasted,
            category_breakdown=category_breakdown,
            estimated_money_saved_usd=money_saved
        )
