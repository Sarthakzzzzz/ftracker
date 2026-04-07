from sqlmodel import SQLModel, create_engine

from app.core.config import settings

sqlite_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=sqlite_args)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
