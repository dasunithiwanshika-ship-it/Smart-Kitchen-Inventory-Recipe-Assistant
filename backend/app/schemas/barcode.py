from pydantic import BaseModel
from typing import Optional, List

class BarcodeLookupRequest(BaseModel):
    barcode: str

class BarcodeLookupOut(BaseModel):
    found: bool
    barcode: str
    food_name: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    default_unit: Optional[str] = "pieces"
    typical_shelf_life_days: Optional[int] = 7
    image_url: Optional[str] = None
    calories_per_100g: Optional[float] = None
    brand: Optional[str] = None
    ingredients_text: Optional[str] = None
    suggested_storage: Optional[str] = "Refrigerator"
