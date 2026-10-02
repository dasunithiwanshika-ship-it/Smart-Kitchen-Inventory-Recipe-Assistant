from app.schemas.user import UserBase, UserCreate, UserLogin, UserUpdate, UserOut, Token, TokenData
from app.schemas.inventory import (
    InventoryItemBase, InventoryItemCreate, InventoryItemUpdate,
    InventoryItemOut, InventoryItemConsume, CategoryOut,
    StorageLocationOut, InventoryStatsOut
)
from app.schemas.leftover import LeftoverBase, LeftoverCreate, LeftoverOut, LeftoverConvertIn
from app.schemas.recipe import RecipeBase, RecipeOut, RecipeIngredientOut, RecipeRecommendationOut
from app.schemas.barcode import BarcodeLookupRequest, BarcodeLookupOut
from app.schemas.analytics import FoodWasteAnalyticsOut, WasteRiskPredictionOut, WasteRiskPredictionItem
from app.schemas.assistant import AssistantMessage, AssistantChatRequest, AssistantChatResponse

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "UserUpdate", "UserOut", "Token", "TokenData",
    "InventoryItemBase", "InventoryItemCreate", "InventoryItemUpdate", "InventoryItemOut",
    "InventoryItemConsume", "CategoryOut", "StorageLocationOut", "InventoryStatsOut",
    "LeftoverBase", "LeftoverCreate", "LeftoverOut", "LeftoverConvertIn",
    "RecipeBase", "RecipeOut", "RecipeIngredientOut", "RecipeRecommendationOut",
    "BarcodeLookupRequest", "BarcodeLookupOut",
    "FoodWasteAnalyticsOut", "WasteRiskPredictionOut", "WasteRiskPredictionItem",
    "AssistantMessage", "AssistantChatRequest", "AssistantChatResponse"
]
