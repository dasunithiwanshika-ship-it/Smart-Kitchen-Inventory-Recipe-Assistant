from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Category, StorageLocation
from app.schemas.inventory import (
    InventoryItemCreate, InventoryItemUpdate, InventoryItemOut,
    InventoryItemConsume, InventoryStatsOut, CategoryOut, StorageLocationOut
)
from app.services.inventory_service import InventoryService
from app.services.expiry_service import ExpiryService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[InventoryItemOut])
def list_inventory(
    storage_location: Optional[str] = Query(None, description="Filter by storage location"),
    status: Optional[str] = Query(None, description="Filter by status: Fresh, Expiring Soon, Critical, Expired"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    is_leftover: Optional[bool] = Query(None, description="Filter leftovers only"),
    search: Optional[str] = Query(None, description="Search term for food name"),
    sort_by: Optional[str] = Query("expiry_date_asc", description="Sort option"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return InventoryService.get_inventory(
        db=db,
        user_id=current_user.id,
        storage_location=storage_location,
        status=status,
        category_id=category_id,
        is_leftover=is_leftover,
        search=search,
        sort_by=sort_by
    )

@router.get("/stats", response_model=InventoryStatsOut)
def get_inventory_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return InventoryService.get_inventory_stats(db, current_user.id)

@router.post("", response_model=InventoryItemOut, status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    item_in: InventoryItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return InventoryService.create_item(db, current_user.id, item_in)

@router.get("/{item_id}", response_model=InventoryItemOut)
def get_single_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = InventoryService.get_item(db, current_user.id, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found.")
    return item

@router.put("/{item_id}", response_model=InventoryItemOut)
def update_inventory_item(
    item_id: int,
    item_in: InventoryItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = InventoryService.update_item(db, current_user.id, item_id, item_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found.")
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = InventoryService.delete_item(db, current_user.id, item_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found.")
    return None

@router.post("/{item_id}/consume", response_model=InventoryItemOut)
def consume_inventory_item(
    item_id: int,
    consume_in: InventoryItemConsume,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = InventoryService.consume_item(
        db=db,
        user_id=current_user.id,
        item_id=item_id,
        quantity=consume_in.quantity,
        action=consume_in.action,
        waste_reason=consume_in.waste_reason
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found.")
    return item
