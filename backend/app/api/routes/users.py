import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep, get_current_admin
from app.core.security import get_password_hash, verify_password
from app.crud.user import create_user, get_user_by_email, update_user
from app.models.common import Message
from app.models.users import (
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", dependencies=[Depends(get_current_admin)], response_model=UsersPublic)
def read_users(
    session: SessionDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
) -> UsersPublic:
    statement = select(User).offset(skip).limit(limit)
    users = list(session.exec(statement).all())
    total = len(list(session.exec(select(User)).all()))
    return UsersPublic(data=[UserPublic.model_validate(user) for user in users], count=total)


@router.post("/", dependencies=[Depends(get_current_admin)], response_model=UserPublic)
def create_user_route(*, session: SessionDep, user_in: UserCreate) -> UserPublic:
    existing = get_user_by_email(session=session, email=user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    user = create_user(session=session, user_create=user_in)
    return UserPublic.model_validate(user)


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(current_user)


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *,
    session: SessionDep,
    user_in: UserUpdateMe,
    current_user: CurrentUser,
) -> UserPublic:
    update_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(update_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return UserPublic.model_validate(current_user)


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *,
    session: SessionDep,
    body: UpdatePassword,
    current_user: CurrentUser,
) -> Message:
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as current password",
        )

    current_user.hashed_password = get_password_hash(body.new_password)
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> UserPublic:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id != current_user.id and not (
        current_user.is_superuser or current_user.role.value == "admin"
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return UserPublic.model_validate(user)


@router.patch("/{user_id}", dependencies=[Depends(get_current_admin)], response_model=UserPublic)
def update_user_route(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> UserPublic:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.email:
        existing = get_user_by_email(session=session, email=user_in.email)
        if existing and existing.id != user_id:
            raise HTTPException(status_code=409, detail="User with this email already exists")

    updated = update_user(session=session, db_user=user, user_in=user_in)
    return UserPublic.model_validate(updated)


@router.delete("/{user_id}", dependencies=[Depends(get_current_admin)], response_model=Message)
def delete_user_route(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    current_user: CurrentUser,
) -> Message:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=403, detail="Admins cannot delete themselves")

    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")
