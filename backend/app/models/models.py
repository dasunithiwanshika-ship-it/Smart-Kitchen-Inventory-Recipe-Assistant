import enum
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime,
    ForeignKey, Text, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class StorageType(str, enum.Enum):
    REFRIGERATOR = "Refrigerator"
    FREEZER = "Freezer"
    PANTRY = "Pantry"
    OUTSIDE = "Outside"

class ItemStatus(str, enum.Enum):
    FRESH = "Fresh"
    EXPIRING_SOON = "Expiring Soon"
    CRITICAL = "Critical"
    EXPIRED = "Expired"
    CONSUMED = "Consumed"
    WASTED = "Wasted"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    notifications_enabled = Column(Boolean, default=True)
    notification_days_before_expiry = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    inventory_items = relationship("InventoryItem", back_populates="user", cascade="all, delete-orphan")
    leftovers = relationship("Leftover", back_populates="user", cascade="all, delete-orphan")
    consumption_history = relationship("ConsumptionHistory", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), nullable=True) # Lucide icon name or emoji
    description = Column(String(255), nullable=True)

    food_items = relationship("FoodItem", back_populates="category")
    inventory_items = relationship("InventoryItem", back_populates="category")

class StorageLocation(Base):
    __tablename__ = "storage_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), nullable=True)
    temperature_type = Column(String(50), nullable=True)

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    barcode = Column(String(100), unique=True, index=True, nullable=True)
    default_unit = Column(String(50), default="pieces")
    typical_shelf_life_days = Column(Integer, default=7)
    image_url = Column(String(500), nullable=True)
    calories_per_100g = Column(Float, nullable=True)

    category = relationship("Category", back_populates="food_items")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="food_item")

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    food_name = Column(String(255), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="SET NULL"), nullable=True)
    barcode = Column(String(100), index=True, nullable=True)
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String(50), nullable=False, default="pieces") # kg, g, L, ml, pieces, packets, bottles, cans, boxes
    storage_location = Column(String(50), nullable=False, default=StorageType.REFRIGERATOR.value) # Refrigerator, Freezer, Pantry, Outside
    purchase_date = Column(Date, default=date.today, nullable=False)
    expiry_date = Column(Date, nullable=True, index=True)
    image_url = Column(String(500), nullable=True)
    is_leftover = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default=ItemStatus.FRESH.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="inventory_items")
    category = relationship("Category", back_populates="inventory_items")
    food_item = relationship("FoodItem")
    leftover = relationship("Leftover", back_populates="inventory_item", uselist=False, cascade="all, delete-orphan")

class Leftover(Base):
    __tablename__ = "leftovers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String(50), nullable=False, default="g")
    prepared_date = Column(Date, default=date.today, nullable=False)
    use_before_date = Column(Date, nullable=False, index=True)
    storage_location = Column(String(50), default=StorageType.REFRIGERATOR.value)
    notes = Column(Text, nullable=True)
    is_consumed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="leftovers")
    inventory_item = relationship("InventoryItem", back_populates="leftover")

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    cuisine = Column(String(100), nullable=True)
    prep_time_minutes = Column(Integer, default=15)
    cook_time_minutes = Column(Integer, default=20)
    difficulty = Column(String(50), default="Medium") # Easy, Medium, Hard
    instructions = Column(JSON, nullable=False) # list of string steps
    image_url = Column(String(500), nullable=True)
    calories = Column(Integer, nullable=True)
    protein_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    fat_g = Column(Float, nullable=True)
    servings = Column(Integer, default=2)
    is_system = Column(Boolean, default=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="SET NULL"), nullable=True)
    ingredient_name = Column(String(255), nullable=False, index=True)
    quantity = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    is_optional = Column(Boolean, default=False)
    category_hint = Column(String(100), nullable=True)

    recipe = relationship("Recipe", back_populates="ingredients")
    food_item = relationship("FoodItem", back_populates="recipe_ingredients")

class ConsumptionHistory(Base):
    __tablename__ = "consumption_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    food_name = Column(String(255), nullable=False)
    category_name = Column(String(100), nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False) # consumed, expired, wasted, leftover_cooked
    waste_reason = Column(String(255), nullable=True) # expired, spoiled, excess
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="consumption_history")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="expiry_warning") # critical, warning, expired, leftover, tip
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")
