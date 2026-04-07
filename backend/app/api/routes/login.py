from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.core.security import create_access_token
from app.crud.user import authenticate
from app.models.common import Token
from app.models.users import UserPublic

router = APIRouter(prefix="/login", tags=["login"])


@router.post("/access-token", response_model=Token)
def login_access_token(
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate(
        session=session,
        email=form_data.username,
        password=form_data.password,
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active or user.status.value == "inactive":
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
        expires_delta=access_token_expires,
    )
    return Token(access_token=token)


@router.post("/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(current_user)
