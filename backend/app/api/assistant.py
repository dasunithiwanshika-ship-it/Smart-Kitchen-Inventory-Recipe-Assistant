from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse
from app.services.ai_service import AIService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/assistant", tags=["AI Kitchen Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_kitchen_assistant(
    request: AssistantChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await AIService.chat_with_assistant(db, current_user.id, request)
