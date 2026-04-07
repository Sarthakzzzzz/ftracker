"""Seed more demo transactions for dashboard charts.

Revision ID: 20260407_more_demo_txns
Revises: 20260407_seed_demo_finance_data
Create Date: 2026-04-07 00:10:00.000000
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from datetime import datetime

revision = "20260407_more_demo_txns"
down_revision = "20260407_seed_demo_finance_data"
branch_labels = None
depends_on = None


transaction_table = sa.table(
    "transaction",
    sa.column("id"),
    sa.column("amount"),
    sa.column("type"),
    sa.column("note"),
    sa.column("date"),
    sa.column("created_at"),
    sa.column("owner_id"),
    sa.column("category_id"),
)


DEMO_ROWS = [
    (
        "00000000-0000-4000-8000-000000000101",
        1000.0,
        "income",
        "wowo",
        "2026-04-03T09:00:00+00:00",
        "admin@example.com",
        "Freelance",
    ),
    (
        "00000000-0000-4000-8000-000000000102",
        650.0,
        "income",
        "Client milestone payment",
        "2026-04-05T10:00:00+00:00",
        "analyst@example.com",
        "Freelance",
    ),
    (
        "00000000-0000-4000-8000-000000000103",
        320.0,
        "expense",
        "Groceries",
        "2026-04-04T18:00:00+00:00",
        "viewer@example.com",
        "Food",
    ),
    (
        "00000000-0000-4000-8000-000000000104",
        180.0,
        "expense",
        "Transport and commute",
        "2026-04-06T08:30:00+00:00",
        "analyst@example.com",
        "Transport",
    ),
    (
        "00000000-0000-4000-8000-000000000105",
        475.0,
        "income",
        "Weekend side project",
        "2026-04-07T13:00:00+00:00",
        "viewer@example.com",
        "Freelance",
    ),
    (
        "00000000-0000-4000-8000-000000000106",
        95.0,
        "expense",
        "Streaming and subscriptions",
        "2026-04-08T20:15:00+00:00",
        "admin@example.com",
        "Entertainment",
    ),
    (
        "00000000-0000-4000-8000-000000000107",
        210.0,
        "expense",
        "Utilities",
        "2026-04-09T07:45:00+00:00",
        "viewer@example.com",
        "Utilities",
    ),
    (
        "00000000-0000-4000-8000-000000000108",
        800.0,
        "income",
        "Monthly bonus",
        "2026-04-10T11:20:00+00:00",
        "admin@example.com",
        "Bonus",
    ),
    (
        "00000000-0000-4000-8000-000000000109",
        980.0,
        "income",
        "January freelance",
        "2026-01-12T09:15:00+00:00",
        "analyst@example.com",
        "Freelance",
    ),
    (
        "00000000-0000-4000-8000-000000000110",
        140.0,
        "expense",
        "January utilities",
        "2026-01-18T19:30:00+00:00",
        "viewer@example.com",
        "Utilities",
    ),
    (
        "00000000-0000-4000-8000-000000000111",
        1250.0,
        "income",
        "February project invoice",
        "2026-02-07T10:00:00+00:00",
        "admin@example.com",
        "Freelance",
    ),
    (
        "00000000-0000-4000-8000-000000000112",
        410.0,
        "expense",
        "February travel",
        "2026-02-14T16:45:00+00:00",
        "viewer@example.com",
        "Travel",
    ),
    (
        "00000000-0000-4000-8000-000000000113",
        1500.0,
        "income",
        "March consulting",
        "2026-03-11T08:50:00+00:00",
        "analyst@example.com",
        "Freelance",
    ),
    (
        "00000000-0000-4000-8000-000000000114",
        275.0,
        "expense",
        "March shopping",
        "2026-03-21T14:20:00+00:00",
        "admin@example.com",
        "Shopping",
    ),
]


def upgrade() -> None:
    connection = op.get_bind()

    user_ids = {
        row[0]: row[1]
        for row in connection.execute(
            sa.text('SELECT email, id FROM "user"')
        ).all()
    }
    category_ids = {
        row[0]: row[1]
        for row in connection.execute(
            sa.text('SELECT name, id FROM category')
        ).all()
    }
    existing_ids = {
        row[0] for row in connection.execute(sa.select(transaction_table.c.id)).all()
    }

    for row_id, amount, txn_type, note, iso_date, email, category_name in DEMO_ROWS:
        if row_id in existing_ids:
            continue
        timestamp = datetime.fromisoformat(iso_date)
        connection.execute(
            sa.insert(transaction_table).values(
                id=row_id,
                amount=amount,
                type=txn_type,
                note=note,
                date=timestamp,
                created_at=timestamp,
                owner_id=user_ids[email],
                category_id=category_ids[category_name],
            )
        )


def downgrade() -> None:
    connection = op.get_bind()
    for row_id, *_ in DEMO_ROWS:
        connection.execute(
            sa.delete(transaction_table).where(transaction_table.c.id == row_id)
        )
