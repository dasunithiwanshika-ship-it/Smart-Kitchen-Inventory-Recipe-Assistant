from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Leftover, ConsumptionHistory, InventoryItem
from app.schemas.leftover import LeftoverCreate, LeftoverConvertIn, LeftoverOut

class LeftoverService:
    @staticmethod
    def get_user_leftovers(db: Session, user_id: int, include_consumed: bool = False) -> List[Leftover]:
        query = db.query(Leftover).filter(Leftover.user_id == user_id)
        if not include_consumed:
            query = query.filter(Leftover.is_consumed == False)
        
        leftovers = query.order_by(Leftover.use_before_date.asc()).all()
        today = date.today()
        for lo in leftovers:
            setattr(lo, "days_remaining", (lo.use_before_date - today).days)
        return leftovers

    @staticmethod
    def create_leftover(db: Session, user_id: int, leftover_in: LeftoverCreate) -> Leftover:
        db_lo = Leftover(
            user_id=user_id,
            inventory_item_id=leftover_in.inventory_item_id,
            name=leftover_in.name,
            quantity=leftover_in.quantity,
            unit=leftover_in.unit,
            prepared_date=leftover_in.prepared_date,
            use_before_date=leftover_in.use_before_date,
            storage_location=leftover_in.storage_location,
            notes=leftover_in.notes,
            is_consumed=False
        )
        db.add(db_lo)
        db.commit()
        db.refresh(db_lo)
        today = date.today()
        setattr(db_lo, "days_remaining", (db_lo.use_before_date - today).days)
        return db_lo

    @staticmethod
    def mark_as_consumed(db: Session, user_id: int, leftover_id: int) -> Optional[Leftover]:
        lo = db.query(Leftover).filter(Leftover.id == leftover_id, Leftover.user_id == user_id).first()
        if not lo:
            return None

        lo.is_consumed = True
        
        # Log to consumption history
        hist = ConsumptionHistory(
            user_id=user_id,
            food_name=f"Leftover: {lo.name}",
            category_name="Prepared / Leftovers",
            quantity=lo.quantity,
            unit=lo.unit,
            action="consumed",
            recorded_at=datetime.utcnow()
        )
        db.add(hist)
        db.commit()
        db.refresh(lo)
        today = date.today()
        setattr(lo, "days_remaining", (lo.use_before_date - today).days)
        return lo

    @staticmethod
    def delete_leftover(db: Session, user_id: int, leftover_id: int) -> bool:
        lo = db.query(Leftover).filter(Leftover.id == leftover_id, Leftover.user_id == user_id).first()
        if not lo:
            return False
        db.delete(lo)
        db.commit()
        return True
