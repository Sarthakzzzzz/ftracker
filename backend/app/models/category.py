import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.models.transactions import TransactionType

if TYPE_CHECKING:
    from app.models.transactions import Transaction


class CategoryBase(SQLModel):
    name: str = Field(max_length=255)
    type: TransactionType


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    type: TransactionType | None = None


class Category(CategoryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_by: uuid.UUID | None = Field(default=None, foreign_key="user.id")

    transactions: list["Transaction"] = Relationship(back_populates="category")


class CategoryPublic(CategoryBase):
    id: uuid.UUID


class CategoriesPublic(SQLModel):
    data: list[CategoryPublic]
    count: int
