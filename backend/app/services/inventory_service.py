from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.models import InventoryItem, Category, ConsumptionHistory, ItemStatus, StorageType, Leftover
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryStatsOut
from app.services.expiry_service import ExpiryService

class InventoryService:
    @staticmethod
    def get_inventory(
        db: Session,
        user_id: int,
        storage_location: Optional[str] = None,
        status: Optional[str] = None,
        category_id: Optional[int] = None,
        is_leftover: Optional[bool] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = "expiry_date_asc" # "expiry_date_asc", "name_asc", "quantity_desc", "recent"
    ) -> List[InventoryItem]:
        query = db.query(InventoryItem).filter(
            InventoryItem.user_id == user_id,
            InventoryItem.quantity > 0
        )

        if storage_location and storage_location.lower() != "all":
            query = query.filter(InventoryItem.storage_location.ilike(storage_location))

        if category_id:
            query = query.filter(InventoryItem.category_id == category_id)

        if is_leftover is not None:
            query = query.filter(InventoryItem.is_leftover == is_leftover)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    InventoryItem.food_name.ilike(search_pattern),
                    InventoryItem.notes.ilike(search_pattern),
                    InventoryItem.barcode.ilike(search_pattern)
                )
            )

        items = query.all()
        # Enrich all items with dynamic days_until_expiry and status
        enriched_items = [ExpiryService.enrich_item(item) for item in items]

        # Filter by calculated status if specified
        if status and status.lower() != "all":
            status_clean = status.lower().replace("_", " ")
            enriched_items = [
                it for it in enriched_items
                if it.status.lower() == status_clean or (status_clean == "expiring soon" and it.status.lower() in ["expiring soon", "critical"])
            ]

        # Sorting
        if sort_by == "expiry_date_asc":
            enriched_items.sort(key=lambda x: x.expiry_date)
        elif sort_by == "name_asc":
            enriched_items.sort(key=lambda x: x.food_name.lower())
        elif sort_by == "quantity_desc":
            enriched_items.sort(key=lambda x: x.quantity, reverse=True)
        elif sort_by == "recent":
            enriched_items.sort(key=lambda x: x.created_at, reverse=True)

        return enriched_items

    @staticmethod
    def get_item(db: Session, user_id: int, item_id: int) -> Optional[InventoryItem]:
        item = db.query(InventoryItem).filter(
            InventoryItem.id == item_id,
            InventoryItem.user_id == user_id
        ).first()
        if item:
            return ExpiryService.enrich_item(item)
        return None

    @staticmethod
    def create_item(db: Session, user_id: int, item_in: InventoryItemCreate) -> InventoryItem:
        db_item = InventoryItem(
            user_id=user_id,
            food_name=item_in.food_name,
            category_id=item_in.category_id,
            barcode=item_in.barcode,
            quantity=item_in.quantity,
            unit=item_in.unit,
            storage_location=item_in.storage_location,
            purchase_date=item_in.purchase_date,
            expiry_date=item_in.expiry_date,
            image_url=item_in.image_url,
            is_leftover=item_in.is_leftover,
            notes=item_in.notes
        )
        # Calculate initial status
        days = ExpiryService.calculate_days_until_expiry(item_in.expiry_date)
        db_item.status = ExpiryService.determine_status(days)

        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return ExpiryService.enrich_item(db_item)

    @staticmethod
    def update_item(db: Session, user_id: int, item_id: int, item_in: InventoryItemUpdate) -> Optional[InventoryItem]:
        db_item = db.query(InventoryItem).filter(
            InventoryItem.id == item_id,
            InventoryItem.user_id == user_id
        ).first()

        if not db_item:
            return None

        update_data = item_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)

        if "expiry_date" in update_data and db_item.expiry_date:
            days = ExpiryService.calculate_days_until_expiry(db_item.expiry_date)
            db_item.status = ExpiryService.determine_status(days)

        db_item.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_item)
        return ExpiryService.enrich_item(db_item)

    @staticmethod
    def delete_item(db: Session, user_id: int, item_id: int) -> bool:
        db_item = db.query(InventoryItem).filter(
            InventoryItem.id == item_id,
            InventoryItem.user_id == user_id
        ).first()

        if not db_item:
            return False

        db.delete(db_item)
        db.commit()
        return True

    @staticmethod
    def consume_item(
        db: Session,
        user_id: int,
        item_id: int,
        quantity: Optional[float] = None,
        action: str = "consumed",
        waste_reason: Optional[str] = None
    ) -> Optional[InventoryItem]:
        db_item = db.query(InventoryItem).filter(
            InventoryItem.id == item_id,
            InventoryItem.user_id == user_id
        ).first()

        if not db_item:
            return None

        consumed_qty = quantity if (quantity is not None and quantity < db_item.quantity) else db_item.quantity
        remaining_qty = db_item.quantity - consumed_qty

        # Log consumption history
        category_name = db_item.category.name if db_item.category else "Uncategorized"
        history = ConsumptionHistory(
            user_id=user_id,
            food_name=db_item.food_name,
            category_name=category_name,
            quantity=consumed_qty,
            unit=db_item.unit,
            action=action,
            waste_reason=waste_reason if action in ["wasted", "expired"] else None
        )
        db.add(history)

        if remaining_qty <= 0:
            db_item.quantity = 0
            db_item.status = ItemStatus.CONSUMED.value if action == "consumed" else ItemStatus.WASTED.value
        else:
            db_item.quantity = remaining_qty

        db_item.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_item)
        return ExpiryService.enrich_item(db_item)

    @staticmethod
    def get_inventory_stats(db: Session, user_id: int) -> InventoryStatsOut:
        items = db.query(InventoryItem).filter(
            InventoryItem.user_id == user_id,
            InventoryItem.quantity > 0
        ).all()

        enriched = [ExpiryService.enrich_item(it) for it in items]

        total_items = len(enriched)
        total_quantity = sum(it.quantity for it in enriched)

        expiring_soon = len([it for it in enriched if it.status == ItemStatus.EXPIRING_SOON.value])
        critical = len([it for it in enriched if it.status == ItemStatus.CRITICAL.value])
        expired = len([it for it in enriched if it.status == ItemStatus.EXPIRED.value])
        fresh = len([it for it in enriched if it.status == ItemStatus.FRESH.value])

        refrigerator = len([it for it in enriched if it.storage_location.lower() == "refrigerator"])
        freezer = len([it for it in enriched if it.storage_location.lower() == "freezer"])
        pantry = len([it for it in enriched if it.storage_location.lower() == "pantry"])
        outside = len([it for it in enriched if it.storage_location.lower() == "outside"])
        leftovers = len([it for it in enriched if it.is_leftover])

        return InventoryStatsOut(
            total_items=total_items,
            total_quantity=round(total_quantity, 2),
            expiring_soon_items=expiring_soon,
            critical_items=critical,
            expired_items=expired,
            fresh_items=fresh,
            refrigerator_items=refrigerator,
            freezer_items=freezer,
            pantry_items=pantry,
            outside_items=outside,
            leftover_items=leftovers
        )
