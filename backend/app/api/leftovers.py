from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.leftover import LeftoverCreate, LeftoverOut
from app.services.leftover_service import LeftoverService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/leftovers", tags=["Leftovers"])

@router.get("", response_model=List[LeftoverOut])
def get_user_leftovers(
    include_consumed: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return LeftoverService.get_user_leftovers(db, current_user.id, include_consumed)

@router.post("", response_model=LeftoverOut, status_code=status.HTTP_201_CREATED)
def create_leftover(
    leftover_in: LeftoverCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return LeftoverService.create_leftover(db, current_user.id, leftover_in)

@router.post("/{leftover_id}/consume", response_model=LeftoverOut)
def consume_leftover(
    leftover_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lo = LeftoverService.mark_as_consumed(db, current_user.id, leftover_id)
    if not lo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leftover not found.")
    return lo

@router.delete("/{leftover_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leftover(
    leftover_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = LeftoverService.delete_leftover(db, current_user.id, leftover_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leftover not found.")
    return None
