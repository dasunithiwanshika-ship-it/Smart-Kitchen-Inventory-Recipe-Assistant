from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Category, StorageLocation
from app.schemas.inventory import CategoryOut, StorageLocationOut

router = APIRouter(tags=["Metadata"])

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/storage-locations", response_model=List[StorageLocationOut])
def get_storage_locations(db: Session = Depends(get_db)):
    return db.query(StorageLocation).all()
