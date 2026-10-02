from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class RecipeIngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ingredient_name: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    is_optional: bool = False
    is_available: bool = False # Calculated based on user inventory
    is_expiring_soon: bool = False # Marked true if user item has < 3 days left

class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    cuisine: Optional[str] = None
    prep_time_minutes: int = 15
    cook_time_minutes: int = 20
    difficulty: str = "Medium"
    instructions: List[str]
    image_url: Optional[str] = None
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    servings: int = 2

class RecipeOut(RecipeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ingredients: List[RecipeIngredientOut]

class RecipeRecommendationOut(RecipeOut):
    match_percentage: float # 0 - 100%
    matched_ingredients: List[str]
    missing_ingredients: List[str]
    expiring_ingredients_used: List[str]
    leftovers_used: List[str]
    recommendation_score: float
    recommendation_reason: str
