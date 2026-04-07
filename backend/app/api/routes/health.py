from fastapi import APIRouter

from app.models.common import Message

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/", response_model=Message)
def health_check() -> Message:
    return Message(message="ok")
