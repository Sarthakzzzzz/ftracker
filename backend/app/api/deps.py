import uuid
from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.config import settings
from app.core.db import engine
from app.core.security import decode_access_token
from app.models.users import User, UserRole

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate credentials",
    )

    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        if not subject:
            raise credentials_error
        user_id = uuid.UUID(str(subject))
    except (ValueError, TypeError):
        raise credentials_error

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.status.value == "inactive" or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*allowed_roles: UserRole):
    allowed_set = set(allowed_roles)

    def role_dependency(current_user: CurrentUser) -> User:
        if current_user.role not in allowed_set:
            raise HTTPException(
                status_code=403,
                detail="The user doesn't have enough privileges",
            )
        return current_user

    return role_dependency


def get_current_admin(current_user: CurrentUser) -> User:
    if current_user.role != UserRole.admin and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint",
        )
    return current_user
