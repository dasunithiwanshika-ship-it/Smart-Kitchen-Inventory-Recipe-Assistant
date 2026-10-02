from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AssistantMessage(BaseModel):
    role: str # "user", "assistant", "system"
    content: str
    timestamp: Optional[str] = None

class AssistantChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[AssistantMessage]] = None
    include_recipes: bool = True
    context_type: Optional[str] = None # "inventory", "leftovers", "expiring", "general"

class AssistantChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = None
    referenced_items: Optional[List[str]] = None
    recipe_suggestions: Optional[List[Dict[str, Any]]] = None
    provider_used: str = "Smart Kitchen AI Engine"
