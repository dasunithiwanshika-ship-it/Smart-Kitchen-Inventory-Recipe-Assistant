from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Recipe
from app.schemas.recipe import RecipeOut, RecipeRecommendationOut
from app.services.recipe_service import RecipeService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/recipes", tags=["Recipes"])

@router.get("", response_model=List[RecipeOut])
def list_recipes(
    cuisine: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return RecipeService.get_recipes(db, cuisine, difficulty, search)

@router.get("/recommendations", response_model=List[RecipeRecommendationOut])
def get_recipe_recommendations(
    limit: int = Query(10, ge=1, le=50),
    min_score: float = Query(0.0, ge=0.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return RecipeService.recommend_recipes(
        db=db,
        user_id=current_user.id,
        limit=limit,
        min_score=min_score
    )

@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe_details(recipe_id: int, db: Session = Depends(get_db)):
    recipe = RecipeService.get_recipe_by_id(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found.")
    return recipe
