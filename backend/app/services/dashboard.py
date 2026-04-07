import uuid
from collections import defaultdict
from datetime import date, datetime, time, timezone

from sqlmodel import Session, col, select

from app.models.category import Category
from app.models.common import CategoryTotal, DashboardSummary, TrendPoint
from app.models.transactions import Transaction, TransactionPublic, TransactionType


def _date_to_start_dt(value: date) -> datetime:
    return datetime.combine(value, time.min).replace(tzinfo=timezone.utc)


def _date_to_end_dt(value: date) -> datetime:
    return datetime.combine(value, time.max).replace(tzinfo=timezone.utc)


def build_dashboard_summary(
    *,
    session: Session,
    from_date: date | None = None,
    to_date: date | None = None,
    recent_limit: int = 5,
    trend_by: str = "monthly",
) -> DashboardSummary:
    statement = select(Transaction)

    if from_date:
        statement = statement.where(col(Transaction.date) >= _date_to_start_dt(from_date))
    if to_date:
        statement = statement.where(col(Transaction.date) <= _date_to_end_dt(to_date))

    transactions = list(session.exec(statement.order_by(col(Transaction.date).desc())).all())
    category_ids = {txn.category_id for txn in transactions}
    categories = (
        list(session.exec(select(Category).where(col(Category.id).in_(category_ids))).all())
        if category_ids
        else []
    )
    category_map = {category.id: category for category in categories}

    total_income = 0.0
    total_expense = 0.0

    category_bucket: dict[tuple[uuid.UUID, str, TransactionType], float] = defaultdict(float)
    trend_bucket: dict[str, dict[str, float]] = defaultdict(
        lambda: {"income": 0.0, "expense": 0.0}
    )

    recent_transactions: list[TransactionPublic] = []

    for txn in transactions:
        if txn.type == TransactionType.income:
            total_income += txn.amount
        else:
            total_expense += txn.amount

        category = category_map.get(txn.category_id)
        if category is None:
            continue

        category_key = (category.id, category.name, category.type)
        category_bucket[category_key] += txn.amount

        if trend_by == "weekly":
            iso_year, iso_week, _ = txn.date.isocalendar()
            period = f"{iso_year}-W{iso_week:02d}"
        else:
            period = txn.date.strftime("%Y-%m")

        trend_bucket[period][txn.type.value] += txn.amount

        if len(recent_transactions) < recent_limit:
            recent_transactions.append(TransactionPublic.model_validate(txn))

    category_totals = [
        CategoryTotal(
            category_id=cat_id,
            category_name=cat_name,
            type=cat_type,
            total=round(total, 2),
        )
        for (cat_id, cat_name, cat_type), total in sorted(
            category_bucket.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    trend = [
        TrendPoint(
            period=period,
            income=round(values["income"], 2),
            expense=round(values["expense"], 2),
            net=round(values["income"] - values["expense"], 2),
        )
        for period, values in sorted(trend_bucket.items())
    ]

    return DashboardSummary(
        from_date=_date_to_start_dt(from_date) if from_date else None,
        to_date=_date_to_end_dt(to_date) if to_date else None,
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        net_balance=round(total_income - total_expense, 2),
        category_totals=category_totals,
        recent_activity=recent_transactions,
        trend=trend,
    )
