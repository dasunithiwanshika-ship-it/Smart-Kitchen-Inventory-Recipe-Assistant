from pydantic import BaseModel
from typing import List, Optional, Dict

class CategoryWasteItem(BaseModel):
    category_name: str
    wasted_count: int
    wasted_quantity_approx_kg: float
    percentage_of_total_waste: float

class FoodWasteAnalyticsOut(BaseModel):
    timeframe: str
    total_consumed_items: int
    total_expired_items: int
    total_wasted_items: int
    waste_rate_percentage: float
    most_wasted_items: List[Dict[str, str]]
    category_breakdown: List[CategoryWasteItem]
    estimated_money_saved_usd: float

class WasteRiskPredictionItem(BaseModel):
    food_name: str
    category_name: str
    risk_level: str # "Low", "Moderate", "High"
    confidence_score: float # 0.0 - 1.0
    predicted_waste_probability: float
    recommendation: str
    has_sufficient_data: bool
    data_points_count: int

class WasteRiskPredictionOut(BaseModel):
    items: List[WasteRiskPredictionItem]
    model_version: str
    overall_kitchen_risk: str
