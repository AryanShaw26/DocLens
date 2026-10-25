from typing import List, Optional
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str  # user, assistant
    content: str

class AssistantQuestionRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []

class AssistantQuestionResponse(BaseModel):
    answer: str
    related_parameters: List[str] = []
    suggested_followups: List[str] = []

