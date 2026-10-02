from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime

class LeftoverBase(BaseModel):
    name: str
    quantity: float = Field(..., gt=0)
    unit: str = "g"
    prepared_date: date = Field(default_factory=date.today)
    use_before_date: date
    storage_location: str = "Refrigerator"
    notes: Optional[str] = None

class LeftoverCreate(LeftoverBase):
    inventory_item_id: Optional[int] = None

class LeftoverOut(LeftoverBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    inventory_item_id: Optional[int] = None
    is_consumed: bool
    days_remaining: int
    created_at: datetime

class LeftoverConvertIn(BaseModel):
    inventory_item_id: Optional[int] = None
    name: str
    quantity: float
    unit: str
    storage_location: str = "Refrigerator"
    shelf_life_days: int = 2
    notes: Optional[str] = None
