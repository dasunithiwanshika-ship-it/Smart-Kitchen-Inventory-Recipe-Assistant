from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.analytics import FoodWasteAnalyticsOut, WasteRiskPredictionOut
from app.services.analytics_service import AnalyticsService
from app.ml.waste_predictor import WastePredictor
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & AI Predictions"])

@router.get("/waste", response_model=FoodWasteAnalyticsOut)
def get_waste_analytics(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_waste_analytics(db, current_user.id, days=days)

@router.get("/predictions", response_model=WasteRiskPredictionOut)
def get_waste_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return WastePredictor.predict_user_waste_risks(db, current_user.id)
