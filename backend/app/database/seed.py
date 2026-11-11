from sqlalchemy.orm import Session
from app.models.models import (
    Base, User, Category, StorageLocation, FoodItem,
    Recipe, RecipeIngredient,
)
from app.database.session import engine

# Legacy demo account that older versions of the app auto-created with fake data.
LEGACY_DEMO_EMAIL = "chef@smartkitchen.ai"


def purge_legacy_demo_data(db: Session) -> None:
    """Remove fake demo data created by earlier versions of the app.

    Older builds seeded a demo account ("Master Chef Alex") with invented
    inventory, leftovers and consumption history, plus a food catalog with
    made-up barcodes. This app is for real household use, so that data is
    deleted. Real user accounts are never touched.
    """
    demo_user = db.query(User).filter(User.email == LEGACY_DEMO_EMAIL).first()
    if demo_user:
        # ORM delete cascades to inventory, leftovers, history and notifications
        db.delete(demo_user)

    fake_catalog = db.query(FoodItem).filter(FoodItem.barcode.like("0123456789%")).all()
    if fake_catalog:
        fake_ids = [f.id for f in fake_catalog]
        db.query(RecipeIngredient).filter(RecipeIngredient.food_item_id.in_(fake_ids)).update(
            {RecipeIngredient.food_item_id: None}, synchronize_session=False
        )
        for f in fake_catalog:
            db.delete(f)

    db.commit()


def seed_database(db: Session):
    """Seed reference data only (categories, storage locations, recipe catalog).

    No products, inventory, leftovers, users or history are created here:
    all of that must come from real user input.
    """
    # Purge any legacy fake demo accounts or products
    purge_legacy_demo_data(db)

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


    # 3. Recipe catalog (reference data used for suggestions)
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
                f_id = None  # no product catalog; matched by name
                r_ing = RecipeIngredient(
                    recipe_id=recipe.id,
                    food_item_id=f_id,
                    ingredient_name=ing_data["name"],
                    quantity=ing_data.get("qty"),
                    unit=ing_data.get("unit"),
                    is_optional=ing_data.get("opt", False)
                )
                db.add(r_ing)


    db.commit()
