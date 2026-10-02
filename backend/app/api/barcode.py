from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.barcode import BarcodeLookupRequest, BarcodeLookupOut
from app.services.barcode_service import BarcodeService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/barcode", tags=["Barcode Scanning"])

@router.post("/scan", response_model=BarcodeLookupOut)
async def scan_or_lookup_barcode(
    req: BarcodeLookupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.barcode or len(req.barcode.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid barcode string is required."
        )
    return await BarcodeService.lookup_barcode(db, req.barcode)

@router.get("/lookup/{barcode}", response_model=BarcodeLookupOut)
async def get_barcode_info(
    barcode: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await BarcodeService.lookup_barcode(db, barcode)
