from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class InventoryItemBase(BaseModel):
    food_name: str
    category_id: Optional[int] = None
    barcode: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit: str = "pieces" # kg, g, L, ml, pieces, packets, bottles, cans, boxes
    storage_location: str = "Refrigerator" # Refrigerator, Freezer, Pantry, Outside
    purchase_date: date = Field(default_factory=date.today)
    expiry_date: Optional[date] = None
    image_url: Optional[str] = None
    is_leftover: bool = False
    notes: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    food_name: Optional[str] = None
    category_id: Optional[int] = None
    barcode: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    storage_location: Optional[str] = None
    purchase_date: Optional[date] = None
    expiry_date: Optional[date] = None
    image_url: Optional[str] = None
    is_leftover: Optional[bool] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class InventoryItemConsume(BaseModel):
    quantity: Optional[float] = None # None means consume all
    action: str = "consumed" # "consumed", "wasted", "expired"
    waste_reason: Optional[str] = None

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None

class InventoryItemOut(InventoryItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: str
    days_until_expiry: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryOut] = None

class StorageLocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: Optional[str] = None
    temperature_type: Optional[str] = None

class InventoryStatsOut(BaseModel):
    total_items: int
    total_quantity: float
    expiring_soon_items: int
    expired_items: int
    critical_items: int
    fresh_items: int
    refrigerator_items: int
    freezer_items: int
    pantry_items: int
    outside_items: int
    leftover_items: int
