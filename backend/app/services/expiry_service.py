from datetime import date, datetime
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.models import InventoryItem, ItemStatus, Notification, User

class ExpiryService:
    @staticmethod
    def calculate_days_until_expiry(expiry_date: Optional[date]) -> Optional[int]:
        if expiry_date is None:
            return None
        today = date.today()
        return (expiry_date - today).days

    @staticmethod
    def determine_status(days_until_expiry: Optional[int], critical_threshold: int = None, warning_threshold: int = None) -> str:
        if days_until_expiry is None:
            return ItemStatus.FRESH.value

        crit = critical_threshold if critical_threshold is not None else settings.EXPIRY_CRITICAL_DAYS
        warn = warning_threshold if warning_threshold is not None else settings.EXPIRY_WARNING_DAYS

        if days_until_expiry < 0:
            return ItemStatus.EXPIRED.value
        elif days_until_expiry <= crit:
            return ItemStatus.CRITICAL.value
        elif days_until_expiry <= warn:
            return ItemStatus.EXPIRING_SOON.value
        else:
            return ItemStatus.FRESH.value

    @classmethod
    def enrich_item(cls, item: InventoryItem, user_warning_days: int = None) -> InventoryItem:
        days = cls.calculate_days_until_expiry(item.expiry_date)
        status = cls.determine_status(days, warning_threshold=user_warning_days)
        # Dynamically attach attributes for schemas
        setattr(item, "days_until_expiry", days)
        setattr(item, "status", status)
        return item

    @classmethod
    def update_user_notifications(cls, db: Session, user: User) -> List[Notification]:
        """Check all active inventory items for a user and create expiry alert notifications if needed."""
        if not user.notifications_enabled:
            return []

        active_items = db.query(InventoryItem).filter(
            InventoryItem.user_id == user.id,
            InventoryItem.quantity > 0
        ).all()

        notifications_created = []
        user_warning_days = user.notification_days_before_expiry or settings.EXPIRY_WARNING_DAYS

        for item in active_items:
            days = cls.calculate_days_until_expiry(item.expiry_date)
            # Update item status in db if changed
            new_status = cls.determine_status(days, warning_threshold=user_warning_days)
            if item.status != new_status:
                item.status = new_status

            if days is None:
                continue

            # Check if notification already exists for today
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            existing_notif = db.query(Notification).filter(
                Notification.user_id == user.id,
                Notification.inventory_item_id == item.id,
                Notification.created_at >= today_start
            ).first()

            if not existing_notif:
                if days < 0:
                    notif = Notification(
                        user_id=user.id,
                        inventory_item_id=item.id,
                        title=f"🔴 {item.food_name} has expired!",
                        message=f"Your {item.food_name} expired on {item.expiry_date.strftime('%b %d, %Y')}. Consider discarding or composting.",
                        notification_type="expired"
                    )
                    db.add(notif)
                    notifications_created.append(notif)
                elif days == 0:
                    notif = Notification(
                        user_id=user.id,
                        inventory_item_id=item.id,
                        title=f"⚠️ {item.food_name} expires TODAY!",
                        message=f"Use your {item.food_name} today to prevent food waste. Check recipe suggestions!",
                        notification_type="critical"
                    )
                    db.add(notif)
                    notifications_created.append(notif)
                elif days <= user_warning_days:
                    notif = Notification(
                        user_id=user.id,
                        inventory_item_id=item.id,
                        title=f"🟠 {item.food_name} expires in {days} day{'s' if days > 1 else ''}",
                        message=f"{item.food_name} ({item.quantity} {item.unit}) will expire soon. Plan a meal with it today.",
                        notification_type="warning"
                    )
                    db.add(notif)
                    notifications_created.append(notif)

        db.commit()
        return notifications_created
