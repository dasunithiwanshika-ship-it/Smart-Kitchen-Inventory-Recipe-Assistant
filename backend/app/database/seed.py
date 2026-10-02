from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    Base, User, Category, StorageLocation, FoodItem,
    InventoryItem, Leftover, Recipe, RecipeIngredient,
    ConsumptionHistory, ItemStatus
)
from app.services.auth_service import get_password_hash
from app.database.session import engine

def seed_database(db: Session):
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)

    # 1. Categories
    categories_data = [
        {"name": "Vegetables", "icon": "Carrot", "description": "Fresh vegetables, herbs, and greens"},
        {"name": "Fruits", "icon": "Apple", "description": "Fresh and dried fruits"},
        {"name": "Meat", "icon": "Beef", "description": "Poultry, beef, pork, and other meats"},
        {"name": "Seafood", "icon": "Fish", "description": "Fish, shrimp, and shellfish"},
        {"name": "Dairy", "icon": "Milk", "description": "Milk, cheese, butter, yogurt, and eggs"},
        {"name": "Grains", "icon": "Wheat", "description": "Rice, pasta, oats, flour, and cereals"},
        {"name": "Bakery", "icon": "Croissant", "description": "Bread, pastries, and baked goods"},
        {"name": "Frozen", "icon": "Snowflake", "description": "Frozen meals, vegetables, and treats"},
        {"name": "Beverages", "icon": "Coffee", "description": "Juices, tea, coffee, and drinks"},
        {"name": "Snacks", "icon": "Cookie", "description": "Chips, nuts, and snacks"},
        {"name": "Spices", "icon": "Sparkles", "description": "Spices, seasonings, oils, and sauces"},
        {"name": "Other", "icon": "Package", "description": "Miscellaneous pantry items"},
    ]

    cat_map = {}
    for cat_data in categories_data:
        cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not cat:
            cat = Category(**cat_data)
            db.add(cat)
            db.flush()
        cat_map[cat.name] = cat.id

    # 2. Storage Locations
    storage_data = [
        {"name": "Refrigerator", "icon": "Refrigerator", "temperature_type": "Chilled (2-4°C)"},
        {"name": "Freezer", "icon": "Snowflake", "temperature_type": "Frozen (-18°C)"},
        {"name": "Pantry", "icon": "Archive", "temperature_type": "Ambient / Dry (18-22°C)"},
        {"name": "Outside", "icon": "Sun", "temperature_type": "Room Temperature"},
    ]
    for st_data in storage_data:
        st = db.query(StorageLocation).filter(StorageLocation.name == st_data["name"]).first()
        if not st:
            st = StorageLocation(**st_data)
            db.add(st)

    # 3. Standard Food Catalog Items with Barcodes
    food_catalog_data = [
        {"name": "Chicken Breast", "category": "Meat", "barcode": "012345678901", "unit": "g", "shelf_life": 3, "image_url": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop", "calories": 165},
        {"name": "Fresh Tomato", "category": "Vegetables", "barcode": "012345678902", "unit": "pieces", "shelf_life": 5, "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", "calories": 18},
        {"name": "Potato", "category": "Vegetables", "barcode": "012345678903", "unit": "kg", "shelf_life": 14, "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop", "calories": 77},
        {"name": "Basmati Rice", "category": "Grains", "barcode": "012345678904", "unit": "kg", "shelf_life": 180, "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop", "calories": 130},
        {"name": "Whole Milk", "category": "Dairy", "barcode": "012345678905", "unit": "L", "shelf_life": 7, "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop", "calories": 62},
        {"name": "Farm Fresh Eggs", "category": "Dairy", "barcode": "012345678906", "unit": "pieces", "shelf_life": 21, "image_url": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop", "calories": 74},
        {"name": "Yellow Onion", "category": "Vegetables", "barcode": "012345678907", "unit": "pieces", "shelf_life": 30, "image_url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop", "calories": 40},
        {"name": "Garlic Bulb", "category": "Vegetables", "barcode": "012345678908", "unit": "pieces", "shelf_life": 45, "image_url": "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop", "calories": 149},
        {"name": "Olive Oil", "category": "Spices", "barcode": "012345678909", "unit": "ml", "shelf_life": 365, "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop", "calories": 884},
        {"name": "Cheddar Cheese", "category": "Dairy", "barcode": "012345678910", "unit": "g", "shelf_life": 20, "image_url": "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500&auto=format&fit=crop", "calories": 402},
        {"name": "Broccoli", "category": "Vegetables", "barcode": "012345678911", "unit": "g", "shelf_life": 6, "image_url": "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500&auto=format&fit=crop", "calories": 34},
        {"name": "Salmon Fillet", "category": "Seafood", "barcode": "012345678912", "unit": "g", "shelf_life": 2, "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop", "calories": 208},
        {"name": "Fresh Spinach", "category": "Vegetables", "barcode": "012345678913", "unit": "g", "shelf_life": 4, "image_url": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", "calories": 23},
        {"name": "Pasta Spaghetti", "category": "Grains", "barcode": "012345678914", "unit": "g", "shelf_life": 365, "image_url": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500&auto=format&fit=crop", "calories": 131},
        {"name": "Ripe Bananas", "category": "Fruits", "barcode": "012345678915", "unit": "pieces", "shelf_life": 5, "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop", "calories": 89},
        {"name": "Butter", "category": "Dairy", "barcode": "012345678916", "unit": "g", "shelf_life": 30, "image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop", "calories": 717},
        {"name": "Fresh Mushrooms", "category": "Vegetables", "barcode": "012345678917", "unit": "g", "shelf_life": 5, "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop", "calories": 22},
        {"name": "Ground Beef", "category": "Meat", "barcode": "012345678918", "unit": "g", "shelf_life": 3, "image_url": "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&auto=format&fit=crop", "calories": 250},
        {"name": "Curry Powder", "category": "Spices", "barcode": "012345678919", "unit": "g", "shelf_life": 365, "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop", "calories": 325},
        {"name": "Soy Sauce", "category": "Spices", "barcode": "012345678920", "unit": "ml", "shelf_life": 365, "image_url": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&auto=format&fit=crop", "calories": 53},
        {"name": "Lemon", "category": "Fruits", "barcode": "012345678921", "unit": "pieces", "shelf_life": 14, "image_url": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop", "calories": 29},
        {"name": "Avocado", "category": "Fruits", "barcode": "012345678922", "unit": "pieces", "shelf_life": 4, "image_url": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop", "calories": 160},
        {"name": "Sourdough Bread", "category": "Bakery", "barcode": "012345678923", "unit": "pieces", "shelf_life": 4, "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop", "calories": 260},
        {"name": "Greek Yogurt", "category": "Dairy", "barcode": "012345678924", "unit": "g", "shelf_life": 10, "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop", "calories": 59},
        {"name": "Fresh Strawberries", "category": "Fruits", "barcode": "012345678925", "unit": "g", "shelf_life": 3, "image_url": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop", "calories": 32},
    ]

    food_map = {}
    for f_data in food_catalog_data:
        food = db.query(FoodItem).filter(FoodItem.name == f_data["name"]).first()
        if not food:
            food = FoodItem(
                name=f_data["name"],
                category_id=cat_map.get(f_data["category"]),
                barcode=f_data["barcode"],
                default_unit=f_data["unit"],
                typical_shelf_life_days=f_data["shelf_life"],
                image_url=f_data["image_url"],
                calories_per_100g=f_data.get("calories")
            )
            db.add(food)
            db.flush()
        food_map[food.name] = food.id

    # 4. Demo User
    demo_user = db.query(User).filter(User.email == "chef@smartkitchen.ai").first()
    if not demo_user:
        demo_user = User(
            email="chef@smartkitchen.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Master Chef Alex",
            notifications_enabled=True,
            notification_days_before_expiry=3
        )
        db.add(demo_user)
        db.flush()

    today = date.today()

    # 5. User Inventory Items with Realistic Dates & Statuses
    inventory_data = [
        # Expiring very soon / Critical (0-1 days)
        {"food_name": "Fresh Tomato", "cat": "Vegetables", "qty": 4, "unit": "pieces", "loc": "Refrigerator", "p_offset": -4, "e_offset": 1, "notes": "Ripe vine tomatoes, use soon"},
        {"food_name": "Chicken Breast", "cat": "Meat", "qty": 500, "unit": "g", "loc": "Refrigerator", "p_offset": -2, "e_offset": 1, "notes": "Fresh organic chicken fillets"},
        {"food_name": "Fresh Strawberries", "cat": "Fruits", "qty": 250, "unit": "g", "loc": "Refrigerator", "p_offset": -3, "e_offset": 1, "notes": "Sweet local berries"},
        {"food_name": "Avocado", "cat": "Fruits", "qty": 2, "unit": "pieces", "loc": "Pantry", "p_offset": -3, "e_offset": 1, "notes": "Soft and perfectly ripe"},
        
        # Expiring Soon (2-3 days)
        {"food_name": "Whole Milk", "cat": "Dairy", "qty": 1.5, "unit": "L", "loc": "Refrigerator", "p_offset": -5, "e_offset": 2, "notes": "Open gallon"},
        {"food_name": "Fresh Spinach", "cat": "Vegetables", "qty": 200, "unit": "g", "loc": "Refrigerator", "p_offset": -2, "e_offset": 2, "notes": "Crispy baby spinach"},
        {"food_name": "Fresh Mushrooms", "cat": "Vegetables", "qty": 300, "unit": "g", "loc": "Refrigerator", "p_offset": -3, "e_offset": 2, "notes": "Button mushrooms for sauté"},
        {"food_name": "Sourdough Bread", "cat": "Bakery", "qty": 1, "unit": "pieces", "loc": "Pantry", "p_offset": -2, "e_offset": 2, "notes": "Artisan loaf"},
        {"food_name": "Salmon Fillet", "cat": "Seafood", "qty": 400, "unit": "g", "loc": "Refrigerator", "p_offset": -1, "e_offset": 2, "notes": "Atlantic salmon"},
        
        # Fresh (4+ days)
        {"food_name": "Potato", "cat": "Vegetables", "qty": 2, "unit": "kg", "loc": "Pantry", "p_offset": -3, "e_offset": 8, "notes": "Russet baking potatoes"},
        {"food_name": "Yellow Onion", "cat": "Vegetables", "qty": 6, "unit": "pieces", "loc": "Pantry", "p_offset": -5, "e_offset": 18, "notes": "Sweet yellow onions"},
        {"food_name": "Garlic Bulb", "cat": "Vegetables", "qty": 3, "unit": "pieces", "loc": "Pantry", "p_offset": -7, "e_offset": 25, "notes": "Fresh garlic"},
        {"food_name": "Farm Fresh Eggs", "cat": "Dairy", "qty": 12, "unit": "pieces", "loc": "Refrigerator", "p_offset": -2, "e_offset": 14, "notes": "Free range large eggs"},
        {"food_name": "Cheddar Cheese", "cat": "Dairy", "qty": 250, "unit": "g", "loc": "Refrigerator", "p_offset": -4, "e_offset": 16, "notes": "Aged cheddar block"},
        {"food_name": "Butter", "cat": "Dairy", "qty": 200, "unit": "g", "loc": "Refrigerator", "p_offset": -5, "e_offset": 22, "notes": "Unsalted European butter"},
        {"food_name": "Basmati Rice", "cat": "Grains", "qty": 3, "unit": "kg", "loc": "Pantry", "p_offset": -10, "e_offset": 90, "notes": "Long grain aromatic rice"},
        {"food_name": "Pasta Spaghetti", "cat": "Grains", "qty": 500, "unit": "g", "loc": "Pantry", "p_offset": -14, "e_offset": 120, "notes": "Italian durum wheat pasta"},
        {"food_name": "Olive Oil", "cat": "Spices", "qty": 750, "unit": "ml", "loc": "Pantry", "p_offset": -20, "e_offset": 180, "notes": "Extra virgin olive oil"},
        {"food_name": "Soy Sauce", "cat": "Spices", "qty": 300, "unit": "ml", "loc": "Pantry", "p_offset": -30, "e_offset": 200, "notes": "Premium brewed soy sauce"},
        {"food_name": "Curry Powder", "cat": "Spices", "qty": 100, "unit": "g", "loc": "Pantry", "p_offset": -15, "e_offset": 150, "notes": "Aromatic curry blend"},
        {"food_name": "Greek Yogurt", "cat": "Dairy", "qty": 500, "unit": "g", "loc": "Refrigerator", "p_offset": -2, "e_offset": 7, "notes": "Plain authentic Greek yogurt"},
        {"food_name": "Ground Beef", "cat": "Meat", "qty": 600, "unit": "g", "loc": "Freezer", "p_offset": -5, "e_offset": 60, "notes": "85% lean ground beef"},
        {"food_name": "Broccoli", "cat": "Vegetables", "qty": 350, "unit": "g", "loc": "Refrigerator", "p_offset": -1, "e_offset": 5, "notes": "Fresh green florets"},
    ]

    for inv in inventory_data:
        existing = db.query(InventoryItem).filter(
            InventoryItem.user_id == demo_user.id,
            InventoryItem.food_name == inv["food_name"]
        ).first()

        p_date = today + timedelta(days=inv["p_offset"])
        e_date = today + timedelta(days=inv["e_offset"])
        status = "Fresh"
        if inv["e_offset"] < 0:
            status = "Expired"
        elif inv["e_offset"] <= 1:
            status = "Critical"
        elif inv["e_offset"] <= 3:
            status = "Expiring Soon"

        if not existing:
            cat_id = cat_map.get(inv["cat"])
            f_item_id = food_map.get(inv["food_name"])
            db_item = InventoryItem(
                user_id=demo_user.id,
                food_name=inv["food_name"],
                category_id=cat_id,
                food_item_id=f_item_id,
                quantity=inv["qty"],
                unit=inv["unit"],
                storage_location=inv["loc"],
                purchase_date=p_date,
                expiry_date=e_date,
                notes=inv["notes"],
                status=status,
                image_url=food_catalog_data[0]["image_url"] if not f_item_id else None
            )
            db.add(db_item)

    # 6. Leftovers
    leftovers_sample = [
        {
            "name": "Chicken Curry",
            "quantity": 450,
            "unit": "g",
            "prep_offset": 0,
            "use_before_offset": 1,
            "storage": "Refrigerator",
            "notes": "Delicious spiced chicken curry with gravy"
        },
        {
            "name": "Vegetable Fried Rice",
            "quantity": 300,
            "unit": "g",
            "prep_offset": -1,
            "use_before_offset": 2,
            "storage": "Refrigerator",
            "notes": "Jasmine rice with peas and carrots"
        }
    ]
    for left in leftovers_sample:
        existing_left = db.query(Leftover).filter(
            Leftover.user_id == demo_user.id,
            Leftover.name == left["name"]
        ).first()
        if not existing_left:
            lo = Leftover(
                user_id=demo_user.id,
                name=left["name"],
                quantity=left["quantity"],
                unit=left["unit"],
                prepared_date=today + timedelta(days=left["prep_offset"]),
                use_before_date=today + timedelta(days=left["use_before_offset"]),
                storage_location=left["storage"],
                notes=left["notes"]
            )
            db.add(lo)

    # 7. Rich Recipe Database (20+ Recipes)
    recipes_data = [
        {
            "title": "Chicken Tomato Curry",
            "description": "A fragrant, rich curry made with tender chicken, sautéed onions, garlic, and fresh ripe tomatoes.",
            "cuisine": "Indian / Fusion",
            "prep_time": 15,
            "cook_time": 25,
            "difficulty": "Easy",
            "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop",
            "calories": 420,
            "protein": 38.0,
            "carbs": 14.0,
            "fat": 18.0,
            "servings": 3,
            "instructions": [
                "Heat olive oil or butter in a pan over medium heat.",
                "Dice the yellow onion and mince garlic; sauté until golden and aromatic.",
                "Cut chicken breast into bite-sized pieces, season with salt, pepper, and curry powder, then brown in the pan.",
                "Chop fresh tomatoes and add to the pan, simmering until they break down into a luscious sauce (approx. 15 minutes).",
                "Serve hot over steamed basmati rice or with toasted bread."
            ],
            "ingredients": [
                {"name": "Chicken Breast", "qty": 500, "unit": "g", "opt": False},
                {"name": "Fresh Tomato", "qty": 3, "unit": "pieces", "opt": False},
                {"name": "Yellow Onion", "qty": 1, "unit": "pieces", "opt": False},
                {"name": "Garlic Bulb", "qty": 2, "unit": "cloves", "opt": False},
                {"name": "Curry Powder", "qty": 15, "unit": "g", "opt": False},
                {"name": "Olive Oil", "qty": 20, "unit": "ml", "opt": True},
            ]
        },
        {
            "title": "Creamy Garlic Butter Chicken",
            "description": "Pan-seared golden chicken breast coated in a velvety garlic butter sauce with fresh spinach.",
            "cuisine": "Continental",
            "prep_time": 10,
            "cook_time": 20,
            "difficulty": "Easy",
            "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop",
            "calories": 480,
            "protein": 42.0,
            "carbs": 6.0,
            "fat": 32.0,
            "servings": 2,
            "instructions": [
                "Season chicken breasts generously with salt and black pepper.",
                "Melt 2 tbsp butter with olive oil in a skillet and sear chicken for 6-7 minutes each side until golden.",
                "Remove chicken, add minced garlic to the remaining butter and fry for 1 minute.",
                "Pour in milk and simmer gently, then fold in fresh spinach until wilted.",
                "Return chicken to the skillet, spoon sauce over the top, and serve warm."
            ],
            "ingredients": [
                {"name": "Chicken Breast", "qty": 400, "unit": "g", "opt": False},
                {"name": "Butter", "qty": 40, "unit": "g", "opt": False},
                {"name": "Garlic Bulb", "qty": 3, "unit": "cloves", "opt": False},
                {"name": "Fresh Spinach", "qty": 100, "unit": "g", "opt": False},
                {"name": "Whole Milk", "qty": 100, "unit": "ml", "opt": True},
            ]
        },
        {
            "title": "Spanish Potato & Onion Omelette (Tortilla)",
            "description": "A comforting Spanish classic made with thinly sliced potatoes, sweet caramelized onions, and farm fresh eggs.",
            "cuisine": "Spanish",
            "prep_time": 15,
            "cook_time": 20,
            "difficulty": "Medium",
            "image_url": "https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=600&auto=format&fit=crop",
            "calories": 360,
            "protein": 18.0,
            "carbs": 26.0,
            "fat": 20.0,
            "servings": 3,
            "instructions": [
                "Peel and thinly slice potatoes and yellow onions.",
                "Gently fry potatoes and onions in olive oil until soft and tender (not browned), about 12 minutes.",
                "Beat eggs in a large bowl with salt. Drain the warm potato-onion mixture and stir into the eggs; let rest 5 min.",
                "Heat a non-stick pan with 1 tbsp oil, pour mixture in, and cook on low heat until edges set.",
                "Carefully flip using a plate and cook the other side for 3-4 minutes until center is just set."
            ],
            "ingredients": [
                {"name": "Potato", "qty": 500, "unit": "g", "opt": False},
                {"name": "Farm Fresh Eggs", "qty": 4, "unit": "pieces", "opt": False},
                {"name": "Yellow Onion", "qty": 1, "unit": "pieces", "opt": False},
                {"name": "Olive Oil", "qty": 30, "unit": "ml", "opt": False},
            ]
        },
        {
            "title": "Avocado & Poached Egg Toast",
            "description": "Toasted sourdough bread topped with creamy mashed avocado, perfectly poached eggs, and chili flakes.",
            "cuisine": "Breakfast / Cafe",
            "prep_time": 5,
            "cook_time": 8,
            "difficulty": "Easy",
            "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop",
            "calories": 340,
            "protein": 14.0,
            "carbs": 28.0,
            "fat": 19.0,
            "servings": 1,
            "instructions": [
                "Toast sourdough bread slices until golden and crisp.",
                "Mash ripe avocado with a pinch of salt, pepper, and optional squeeze of lemon juice.",
                "Poach farm fresh eggs in gently simmering water for 3 minutes until whites are firm and yolk is runny.",
                "Spread avocado generously over the toast, top with poached egg, and garnish with seasonings."
            ],
            "ingredients": [
                {"name": "Avocado", "qty": 1, "unit": "pieces", "opt": False},
                {"name": "Farm Fresh Eggs", "qty": 2, "unit": "pieces", "opt": False},
                {"name": "Sourdough Bread", "qty": 2, "unit": "pieces", "opt": False},
                {"name": "Olive Oil", "qty": 5, "unit": "ml", "opt": True},
            ]
        },
        {
            "title": "Strawberry Greek Yogurt Parfait",
            "description": "A nutritious and refreshing high-protein breakfast or snack layered with fresh ripe strawberries and Greek yogurt.",
            "cuisine": "Healthy / Breakfast",
            "prep_time": 5,
            "cook_time": 0,
            "difficulty": "Easy",
            "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop",
            "calories": 220,
            "protein": 19.0,
            "carbs": 22.0,
            "fat": 4.0,
            "servings": 1,
            "instructions": [
                "Wash and slice fresh strawberries.",
                "Spoon a thick layer of Greek yogurt into a glass or bowl.",
                "Layer sliced strawberries over yogurt, then repeat layers.",
                "Drizzle with honey if desired and enjoy chilled."
            ],
            "ingredients": [
                {"name": "Fresh Strawberries", "qty": 150, "unit": "g", "opt": False},
                {"name": "Greek Yogurt", "qty": 200, "unit": "g", "opt": False},
                {"name": "Ripe Bananas", "qty": 1, "unit": "pieces", "opt": True},
            ]
        },
        {
            "title": "Pan-Seared Salmon with Garlic Spinach",
            "description": "Crispy skin salmon fillet served over a bed of sautéed garlic butter baby spinach.",
            "cuisine": "Mediterranean",
            "prep_time": 8,
            "cook_time": 12,
            "difficulty": "Medium",
            "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop",
            "calories": 450,
            "protein": 39.0,
            "carbs": 4.0,
            "fat": 29.0,
            "servings": 2,
            "instructions": [
                "Pat salmon fillets dry with paper towel; season with sea salt and black pepper.",
                "Heat olive oil in a skillet over high heat; place salmon skin-side down and press gently. Sear for 5 mins.",
                "Flip salmon, add 1 tbsp butter and garlic, baste for 2-3 minutes until cooked through.",
                "In a separate pan, flash-fry spinach in garlic butter for 90 seconds until wilted.",
                "Plate salmon atop the warm spinach and serve immediately."
            ],
            "ingredients": [
                {"name": "Salmon Fillet", "qty": 350, "unit": "g", "opt": False},
                {"name": "Fresh Spinach", "qty": 150, "unit": "g", "opt": False},
                {"name": "Garlic Bulb", "qty": 2, "unit": "cloves", "opt": False},
                {"name": "Butter", "qty": 20, "unit": "g", "opt": False},
                {"name": "Olive Oil", "qty": 10, "unit": "ml", "opt": True},
            ]
        },
        {
            "title": "Creamy Garlic Mushroom Pasta",
            "description": "Spaghetti tossed with sautéed mushrooms, caramelized garlic, rich butter sauce, and shredded cheddar cheese.",
            "cuisine": "Italian",
            "prep_time": 10,
            "cook_time": 15,
            "difficulty": "Easy",
            "image_url": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop",
            "calories": 520,
            "protein": 18.0,
            "carbs": 68.0,
            "fat": 21.0,
            "servings": 2,
            "instructions": [
                "Boil pasta in salted water until al dente; reserve 1/2 cup pasta water.",
                "Slice mushrooms and garlic. In a skillet, melt butter and brown mushrooms on high heat.",
                "Add garlic and sauté for 1 minute until fragrant.",
                "Toss cooked spaghetti into the pan with pasta water, milk, and melted cheddar cheese.",
                "Stir vigorously until a silky sauce coats every strand of pasta."
            ],
            "ingredients": [
                {"name": "Pasta Spaghetti", "qty": 250, "unit": "g", "opt": False},
                {"name": "Fresh Mushrooms", "qty": 200, "unit": "g", "opt": False},
                {"name": "Garlic Bulb", "qty": 3, "unit": "cloves", "opt": False},
                {"name": "Butter", "qty": 30, "unit": "g", "opt": False},
                {"name": "Cheddar Cheese", "qty": 60, "unit": "g", "opt": True},
                {"name": "Whole Milk", "qty": 50, "unit": "ml", "opt": True},
            ]
        },
        {
            "title": "Loaded Vegetable Egg Fried Rice",
            "description": "Savory fried rice loaded with scrambled eggs, diced onions, broccoli, garlic, and seasoned with rich soy sauce.",
            "cuisine": "Asian",
            "prep_time": 10,
            "cook_time": 10,
            "difficulty": "Easy",
            "image_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop",
            "calories": 380,
            "protein": 14.0,
            "carbs": 55.0,
            "fat": 12.0,
            "servings": 2,
            "instructions": [
                "Heat oil in a wok or large pan. Crack eggs in and scramble quickly; set aside.",
                "Add more oil, fry diced onions, garlic, and chopped broccoli florets for 3 minutes.",
                "Add cold cooked basmati rice (or leftover rice), breaking up clumps.",
                "Drizzle soy sauce all over, stir-fry on high heat for 3 minutes, then fold in scrambled eggs."
            ],
            "ingredients": [
                {"name": "Basmati Rice", "qty": 300, "unit": "g", "opt": False},
                {"name": "Farm Fresh Eggs", "qty": 3, "unit": "pieces", "opt": False},
                {"name": "Broccoli", "qty": 150, "unit": "g", "opt": False},
                {"name": "Yellow Onion", "qty": 1, "unit": "pieces", "opt": False},
                {"name": "Garlic Bulb", "qty": 2, "unit": "cloves", "opt": False},
                {"name": "Soy Sauce", "qty": 25, "unit": "ml", "opt": False},
            ]
        },
        {
            "title": "Crispy Garlic Roasted Potatoes",
            "description": "Oven-roasted potato cubes with crispy golden edges, infused with rosemary, garlic, and extra virgin olive oil.",
            "cuisine": "American / Side",
            "prep_time": 10,
            "cook_time": 30,
            "difficulty": "Easy",
            "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop",
            "calories": 260,
            "protein": 5.0,
            "carbs": 42.0,
            "fat": 9.0,
            "servings": 3,
            "instructions": [
                "Preheat oven to 200°C (400°F).",
                "Wash and cut potatoes into bite-sized 1-inch cubes.",
                "Toss potatoes in a bowl with olive oil, minced garlic, salt, and black pepper.",
                "Spread evenly on a baking sheet and roast for 25-30 minutes until golden and crispy."
            ],
            "ingredients": [
                {"name": "Potato", "qty": 600, "unit": "g", "opt": False},
                {"name": "Garlic Bulb", "qty": 3, "unit": "cloves", "opt": False},
                {"name": "Olive Oil", "qty": 25, "unit": "ml", "opt": False},
            ]
        },
        {
            "title": "Classic Fresh Tomato Bruschetta",
            "description": "Toasted artisan sourdough bread topped with diced ripe tomatoes, minced garlic, olive oil, and fresh herbs.",
            "cuisine": "Italian",
            "prep_time": 8,
            "cook_time": 4,
            "difficulty": "Easy",
            "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&auto=format&fit=crop",
            "calories": 190,
            "protein": 6.0,
            "carbs": 24.0,
            "fat": 8.0,
            "servings": 2,
            "instructions": [
                "Dice ripe fresh tomatoes and place in a bowl.",
                "Stir in minced garlic, olive oil, a pinch of salt, and pepper; allow to marinate for 5 minutes.",
                "Toast sourdough bread slices until golden brown and crusty.",
                "Spoon the seasoned tomato mixture generously over warm bread slices and serve."
            ],
            "ingredients": [
                {"name": "Fresh Tomato", "qty": 3, "unit": "pieces", "opt": False},
                {"name": "Sourdough Bread", "qty": 3, "unit": "pieces", "opt": False},
                {"name": "Garlic Bulb", "qty": 2, "unit": "cloves", "opt": False},
                {"name": "Olive Oil", "qty": 15, "unit": "ml", "opt": False},
            ]
        }
    ]

    for r_data in recipes_data:
        existing_recipe = db.query(Recipe).filter(Recipe.title == r_data["title"]).first()
        if not existing_recipe:
            recipe = Recipe(
                title=r_data["title"],
                description=r_data["description"],
                cuisine=r_data["cuisine"],
                prep_time_minutes=r_data["prep_time"],
                cook_time_minutes=r_data["cook_time"],
                difficulty=r_data["difficulty"],
                image_url=r_data["image_url"],
                calories=r_data.get("calories"),
                protein_g=r_data.get("protein"),
                carbs_g=r_data.get("carbs"),
                fat_g=r_data.get("fat"),
                servings=r_data.get("servings", 2),
                instructions=r_data["instructions"],
                is_system=True
            )
            db.add(recipe)
            db.flush()

            for ing_data in r_data["ingredients"]:
                f_id = food_map.get(ing_data["name"])
                r_ing = RecipeIngredient(
                    recipe_id=recipe.id,
                    food_item_id=f_id,
                    ingredient_name=ing_data["name"],
                    quantity=ing_data.get("qty"),
                    unit=ing_data.get("unit"),
                    is_optional=ing_data.get("opt", False)
                )
                db.add(r_ing)

    # 8. Sample Consumption and Waste History for Realistic Analytics
    sample_history = [
        {"food": "Fresh Tomato", "cat": "Vegetables", "qty": 3, "unit": "pieces", "action": "consumed", "days_ago": 1},
        {"food": "Whole Milk", "cat": "Dairy", "qty": 0.5, "unit": "L", "action": "consumed", "days_ago": 2},
        {"food": "Chicken Breast", "cat": "Meat", "qty": 400, "unit": "g", "action": "consumed", "days_ago": 3},
        {"food": "Potato", "cat": "Vegetables", "qty": 500, "unit": "g", "action": "consumed", "days_ago": 4},
        {"food": "Fresh Spinach", "cat": "Vegetables", "qty": 100, "unit": "g", "action": "expired", "days_ago": 5, "reason": "expired"},
        {"food": "Sourdough Bread", "cat": "Bakery", "qty": 0.5, "unit": "pieces", "action": "wasted", "days_ago": 7, "reason": "stale"},
        {"food": "Yellow Onion", "cat": "Vegetables", "qty": 2, "unit": "pieces", "action": "consumed", "days_ago": 8},
        {"food": "Pasta Spaghetti", "cat": "Grains", "qty": 250, "unit": "g", "action": "consumed", "days_ago": 10},
    ]

    for h in sample_history:
        h_date = datetime.utcnow() - timedelta(days=h["days_ago"])
        hist = ConsumptionHistory(
            user_id=demo_user.id,
            food_name=h["food"],
            category_name=h["cat"],
            quantity=h["qty"],
            unit=h["unit"],
            action=h["action"],
            waste_reason=h.get("reason"),
            recorded_at=h_date
        )
        db.add(hist)

    db.commit()
    print("Database successfully seeded with realistic Smart Kitchen data!")
