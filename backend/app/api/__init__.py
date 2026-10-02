from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.inventory import router as inventory_router
from app.api.barcode import router as barcode_router
from app.api.recipes import router as recipes_router
from app.api.leftovers import router as leftovers_router
from app.api.analytics import router as analytics_router
from app.api.assistant import router as assistant_router
from app.api.metadata import router as metadata_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(inventory_router)
api_router.include_router(barcode_router)
api_router.include_router(recipes_router)
api_router.include_router(leftovers_router)
api_router.include_router(analytics_router)
api_router.include_router(assistant_router)
api_router.include_router(metadata_router)
