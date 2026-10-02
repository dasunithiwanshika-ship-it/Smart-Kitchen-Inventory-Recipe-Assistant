import httpx
from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import FoodItem, Category
from app.schemas.barcode import BarcodeLookupOut

class BarcodeService:
    @staticmethod
    async def lookup_barcode(db: Session, barcode: str) -> BarcodeLookupOut:
        clean_code = barcode.strip()

        # 1. Search in local FoodItem catalog
        local_item = db.query(FoodItem).filter(FoodItem.barcode == clean_code).first()
        if local_item:
            cat_name = local_item.category.name if local_item.category else "Other"
            suggested_storage = "Refrigerator"
            if cat_name in ["Grains", "Spices", "Snacks", "Bakery"]:
                suggested_storage = "Pantry"
            elif cat_name == "Frozen":
                suggested_storage = "Freezer"

            return BarcodeLookupOut(
                found=True,
                barcode=clean_code,
                food_name=local_item.name,
                category_id=local_item.category_id,
                category_name=cat_name,
                default_unit=local_item.default_unit or "pieces",
                typical_shelf_life_days=local_item.typical_shelf_life_days or 7,
                image_url=local_item.image_url,
                calories_per_100g=local_item.calories_per_100g,
                suggested_storage=suggested_storage
            )

        # 2. Query OpenFoodFacts API asynchronously
        try:
            url = f"https://world.openfoodfacts.org/api/v0/product/{clean_code}.json"
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get(url, headers={"User-Agent": "SmartKitchenAI - Python/FastAPI"})
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == 1 and "product" in data:
                        product = data["product"]
                        product_name = (
                            product.get("product_name_en")
                            or product.get("product_name")
                            or product.get("generic_name")
                            or "Unknown Product"
                        )
                        brand = product.get("brands", "")
                        image_url = product.get("image_front_url") or product.get("image_url")
                        
                        # Category detection
                        categories_hierarchy = product.get("categories_hierarchy", [])
                        categories_str = " ".join(categories_hierarchy).lower()
                        
                        category_name = "Other"
                        suggested_storage = "Pantry"
                        typical_shelf_life = 14

                        if any(w in categories_str for w in ["dairy", "milk", "cheese", "yogurt"]):
                            category_name = "Dairy"
                            suggested_storage = "Refrigerator"
                            typical_shelf_life = 7
                        elif any(w in categories_str for w in ["meat", "chicken", "beef", "poultry"]):
                            category_name = "Meat"
                            suggested_storage = "Refrigerator"
                            typical_shelf_life = 3
                        elif any(w in categories_str for w in ["fish", "seafood", "salmon", "shrimp"]):
                            category_name = "Seafood"
                            suggested_storage = "Refrigerator"
                            typical_shelf_life = 2
                        elif any(w in categories_str for w in ["vegetable", "plant", "produce"]):
                            category_name = "Vegetables"
                            suggested_storage = "Refrigerator"
                            typical_shelf_life = 6
                        elif any(w in categories_str for w in ["fruit", "berry", "apple", "banana"]):
                            category_name = "Fruits"
                            suggested_storage = "Refrigerator"
                            typical_shelf_life = 5
                        elif any(w in categories_str for w in ["frozen", "ice-cream"]):
                            category_name = "Frozen"
                            suggested_storage = "Freezer"
                            typical_shelf_life = 90
                        elif any(w in categories_str for w in ["bread", "bakery", "pastry"]):
                            category_name = "Bakery"
                            suggested_storage = "Pantry"
                            typical_shelf_life = 4
                        elif any(w in categories_str for w in ["cereal", "grain", "rice", "pasta"]):
                            category_name = "Grains"
                            suggested_storage = "Pantry"
                            typical_shelf_life = 180

                        db_cat = db.query(Category).filter(Category.name.ilike(category_name)).first()

                        return BarcodeLookupOut(
                            found=True,
                            barcode=clean_code,
                            food_name=product_name,
                            category_id=db_cat.id if db_cat else None,
                            category_name=category_name,
                            default_unit="pieces",
                            typical_shelf_life_days=typical_shelf_life,
                            image_url=image_url,
                            brand=brand,
                            suggested_storage=suggested_storage
                        )
        except Exception:
            # Fallback gracefully if network is unavailable or timeout happens
            pass

        # 3. Not found - allow user to fill manually
        return BarcodeLookupOut(
            found=False,
            barcode=clean_code,
            food_name=None,
            suggested_storage="Refrigerator",
            typical_shelf_life_days=7
        )
