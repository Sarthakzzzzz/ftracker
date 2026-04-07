from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models.users import User, UserCreate, UserUpdate


def get_user_by_email(*, session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_user = User.model_validate(
        user_create,
        update={"hashed_password": get_password_hash(user_create.password)},
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> User:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data: dict[str, Any] = {}

    if "password" in user_data and user_data["password"]:
        extra_data["hashed_password"] = get_password_hash(user_data.pop("password"))

    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session=session, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
