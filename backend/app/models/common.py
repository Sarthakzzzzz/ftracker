import uuid
from datetime import datetime

from sqlmodel import SQLModel

from app.models.transactions import TransactionPublic, TransactionType


class Message(SQLModel):
    message: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    sub: str | None = None
    role: str | None = None
    exp: int | None = None


class CategoryTotal(SQLModel):
    category_id: uuid.UUID
    category_name: str
    type: TransactionType
    total: float


class TrendPoint(SQLModel):
    period: str
    income: float
    expense: float
    net: float


class DashboardSummary(SQLModel):
    from_date: datetime | None = None
    to_date: datetime | None = None
    total_income: float
    total_expense: float
    net_balance: float
    category_totals: list[CategoryTotal]
    recent_activity: list[TransactionPublic]
    trend: list[TrendPoint]
