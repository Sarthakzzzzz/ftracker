import uuid
from datetime import date, datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING

from pydantic import model_validator
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.users import User


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


class TransactionBase(SQLModel):
    amount: float = Field(gt=0)
    type: TransactionType
    note: str | None = Field(default=None, max_length=255)
    date: datetime = Field(default_factory=get_datetime_utc)


class TransactionCreate(TransactionBase):
    category_id: uuid.UUID


class TransactionUpdate(SQLModel):
    amount: float | None = Field(default=None, gt=0)
    type: TransactionType | None = None
    note: str | None = Field(default=None, max_length=255)
    category_id: uuid.UUID | None = None
    date: datetime | None = None


class TransactionFilters(SQLModel):
    type: TransactionType | None = None
    category_id: uuid.UUID | None = None
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="after")
    def validate_date_range(self) -> "TransactionFilters":
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValueError("start_date cannot be greater than end_date")
        return self


class Transaction(TransactionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore[arg-type]
    )

    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    category_id: uuid.UUID = Field(foreign_key="category.id", nullable=False)

    owner: "User" = Relationship(back_populates="transactions")
    category: "Category" = Relationship(back_populates="transactions")


class TransactionPublic(TransactionBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    category_id: uuid.UUID
    created_at: datetime | None = None


class TransactionsPublic(SQLModel):
    data: list[TransactionPublic]
    count: int
