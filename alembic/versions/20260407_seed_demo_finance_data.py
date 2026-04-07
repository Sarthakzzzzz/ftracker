"""Seed demo finance data with Alembic.

Revision ID: 20260407_seed_demo_finance_data
Revises:
Create Date: 2026-04-07 00:00:00.000000
"""

from __future__ import annotations

import base64
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import sqlalchemy as sa
from alembic import op

revision = "20260407_seed_demo_finance_data"
down_revision = None
branch_labels = None
depends_on = None

PASSWORD_HASH_ITERATIONS = 200_000


def _seed_uuid(label: str) -> uuid.UUID:
    return uuid.uuid5(uuid.NAMESPACE_URL, f"ftracker-demo:{label}")


def _urlsafe_b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _get_password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_HASH_ITERATIONS,
    )
    salt_b64 = _urlsafe_b64encode(salt)
    hash_b64 = _urlsafe_b64encode(derived_key)
    return f"pbkdf2_sha256${PASSWORD_HASH_ITERATIONS}${salt_b64}${hash_b64}"


user_table = sa.table(
    "user",
    sa.column("id"),
    sa.column("email"),
    sa.column("full_name"),
    sa.column("role"),
    sa.column("status"),
    sa.column("is_active"),
    sa.column("is_superuser"),
    sa.column("hashed_password"),
    sa.column("created_at"),
)

category_table = sa.table(
    "category",
    sa.column("id"),
    sa.column("name"),
    sa.column("type"),
    sa.column("created_by"),
)

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

USER_SEEDS = [
    {
        "id": _seed_uuid("user-admin"),
        "email": "admin@example.com",
        "full_name": "System Admin",
        "password": "adminadmin",
        "role": "admin",
        "status": "active",
        "is_active": True,
        "is_superuser": True,
    },
    {
        "id": _seed_uuid("user-analyst"),
        "email": "analyst@example.com",
        "full_name": "Finance Analyst",
        "password": "analyst123",
        "role": "analyst",
        "status": "active",
        "is_active": True,
        "is_superuser": False,
    },
    {
        "id": _seed_uuid("user-viewer"),
        "email": "viewer@example.com",
        "full_name": "Finance Viewer",
        "password": "viewer123",
        "role": "viewer",
        "status": "active",
        "is_active": True,
        "is_superuser": False,
    },
]


CATEGORY_SEEDS = [
    {"id": _seed_uuid("category-salary"), "name": "Salary", "type": "income"},
    {"id": _seed_uuid("category-freelance"), "name": "Freelance", "type": "income"},
    {"id": _seed_uuid("category-investment"), "name": "Investment", "type": "income"},
    {"id": _seed_uuid("category-bonus"), "name": "Bonus", "type": "income"},
    {"id": _seed_uuid("category-rent"), "name": "Rent", "type": "expense"},
    {"id": _seed_uuid("category-food"), "name": "Food", "type": "expense"},
    {"id": _seed_uuid("category-utilities"), "name": "Utilities", "type": "expense"},
    {"id": _seed_uuid("category-transport"), "name": "Transport", "type": "expense"},
    {"id": _seed_uuid("category-shopping"), "name": "Shopping", "type": "expense"},
    {"id": _seed_uuid("category-health"), "name": "Health", "type": "expense"},
    {"id": _seed_uuid("category-entertainment"), "name": "Entertainment", "type": "expense"},
    {"id": _seed_uuid("category-travel"), "name": "Travel", "type": "expense"},
]


TRANSACTION_SEEDS = [
    {
        "id": _seed_uuid("txn-admin-salary"),
        "email": "admin@example.com",
        "category": "Salary",
        "amount": 6200.0,
        "type": "income",
        "note": "Monthly salary",
        "days_back": 0,
    },
    {
        "id": _seed_uuid("txn-admin-consulting"),
        "email": "admin@example.com",
        "category": "Freelance",
        "amount": 1000.0,
        "type": "income",
        "note": "wowo",
        "days_back": 4,
    },
    {
        "id": _seed_uuid("txn-admin-bonus-april"),
        "email": "admin@example.com",
        "category": "Bonus",
        "amount": 750.0,
        "type": "income",
        "note": "Project completion bonus",
        "days_back": 8,
    },
    {
        "id": _seed_uuid("txn-admin-investment"),
        "email": "admin@example.com",
        "category": "Investment",
        "amount": 450.0,
        "type": "income",
        "note": "Dividend payout",
        "days_back": 60,
    },
    {
        "id": _seed_uuid("txn-admin-rent"),
        "email": "admin@example.com",
        "category": "Rent",
        "amount": 1800.0,
        "type": "expense",
        "note": "Apartment rent",
        "days_back": 0,
    },
    {
        "id": _seed_uuid("txn-admin-groceries"),
        "email": "admin@example.com",
        "category": "Food",
        "amount": 145.5,
        "type": "expense",
        "note": "Weekly groceries",
        "days_back": 3,
    },
    {
        "id": _seed_uuid("txn-admin-software"),
        "email": "admin@example.com",
        "category": "Shopping",
        "amount": 89.99,
        "type": "expense",
        "note": "Software subscription",
        "days_back": 6,
    },
    {
        "id": _seed_uuid("txn-admin-food"),
        "email": "admin@example.com",
        "category": "Food",
        "amount": 360.0,
        "type": "expense",
        "note": "Groceries and dining",
        "days_back": 15,
    },
    {
        "id": _seed_uuid("txn-admin-utilities"),
        "email": "admin@example.com",
        "category": "Utilities",
        "amount": 220.0,
        "type": "expense",
        "note": "Electricity and internet",
        "days_back": 30,
    },
    {
        "id": _seed_uuid("txn-analyst-freelance"),
        "email": "analyst@example.com",
        "category": "Freelance",
        "amount": 1450.0,
        "type": "income",
        "note": "Client project",
        "days_back": 30,
    },
    {
        "id": _seed_uuid("txn-analyst-april-freelance"),
        "email": "analyst@example.com",
        "category": "Freelance",
        "amount": 1200.0,
        "type": "income",
        "note": "April client invoice",
        "days_back": 5,
    },
    {
        "id": _seed_uuid("txn-analyst-bonus"),
        "email": "analyst@example.com",
        "category": "Bonus",
        "amount": 800.0,
        "type": "income",
        "note": "Quarterly bonus",
        "days_back": 60,
    },
    {
        "id": _seed_uuid("txn-analyst-transport"),
        "email": "analyst@example.com",
        "category": "Transport",
        "amount": 120.0,
        "type": "expense",
        "note": "Commute costs",
        "days_back": 30,
    },
    {
        "id": _seed_uuid("txn-analyst-cafe"),
        "email": "analyst@example.com",
        "category": "Food",
        "amount": 62.0,
        "type": "expense",
        "note": "Client lunch",
        "days_back": 7,
    },
    {
        "id": _seed_uuid("txn-analyst-health"),
        "email": "analyst@example.com",
        "category": "Health",
        "amount": 210.0,
        "type": "expense",
        "note": "Medicines and checkup",
        "days_back": 45,
    },
    {
        "id": _seed_uuid("txn-analyst-entertainment"),
        "email": "analyst@example.com",
        "category": "Entertainment",
        "amount": 180.0,
        "type": "expense",
        "note": "Streaming and outings",
        "days_back": 75,
    },
    {
        "id": _seed_uuid("txn-viewer-freelance"),
        "email": "viewer@example.com",
        "category": "Freelance",
        "amount": 900.0,
        "type": "income",
        "note": "Side gig",
        "days_back": 30,
    },
    {
        "id": _seed_uuid("txn-viewer-april-sidegig"),
        "email": "viewer@example.com",
        "category": "Freelance",
        "amount": 875.0,
        "type": "income",
        "note": "April side project",
        "days_back": 9,
    },
    {
        "id": _seed_uuid("txn-viewer-shopping"),
        "email": "viewer@example.com",
        "category": "Shopping",
        "amount": 260.0,
        "type": "expense",
        "note": "Clothing and supplies",
        "days_back": 45,
    },
    {
        "id": _seed_uuid("txn-viewer-food"),
        "email": "viewer@example.com",
        "category": "Food",
        "amount": 240.0,
        "type": "expense",
        "note": "Weekly food spend",
        "days_back": 60,
    },
    {
        "id": _seed_uuid("txn-viewer-travel"),
        "email": "viewer@example.com",
        "category": "Travel",
        "amount": 520.0,
        "type": "expense",
        "note": "Weekend trip",
        "days_back": 90,
    },
    {
        "id": _seed_uuid("txn-viewer-utilities"),
        "email": "viewer@example.com",
        "category": "Utilities",
        "amount": 110.0,
        "type": "expense",
        "note": "Mobile and internet",
        "days_back": 12,
    },
    {
        "id": _seed_uuid("txn-viewer-investment"),
        "email": "viewer@example.com",
        "category": "Investment",
        "amount": 300.0,
        "type": "income",
        "note": "Mutual fund gain",
        "days_back": 90,
    },
]


def upgrade() -> None:
    connection = op.get_bind()
    now = datetime.now(timezone.utc)

    connection.execute(
        sa.text(
            "CREATE TABLE IF NOT EXISTS \"user\" "
            "(id UUID PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, "
            "full_name VARCHAR(255), role VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, "
            "is_active BOOLEAN NOT NULL, is_superuser BOOLEAN NOT NULL, "
            "hashed_password VARCHAR NOT NULL, created_at TIMESTAMP WITH TIME ZONE)"
        )
    )
    connection.execute(
        sa.text(
            "CREATE TABLE IF NOT EXISTS category "
            "(id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, type VARCHAR(20) NOT NULL, "
            "created_by UUID REFERENCES \"user\"(id))"
        )
    )
    connection.execute(
        sa.text(
            "CREATE TABLE IF NOT EXISTS \"transaction\" "
            "(id UUID PRIMARY KEY, amount DOUBLE PRECISION NOT NULL, type VARCHAR(20) NOT NULL, "
            "note VARCHAR(255), date TIMESTAMP WITH TIME ZONE NOT NULL, "
            "created_at TIMESTAMP WITH TIME ZONE, owner_id UUID NOT NULL REFERENCES \"user\"(id), "
            "category_id UUID NOT NULL REFERENCES category(id))"
        )
    )

    existing_users = {
        row[0]
        for row in connection.execute(sa.select(user_table.c.email)).all()
    }
    for user_seed in USER_SEEDS:
        if user_seed["email"] in existing_users:
            continue
        connection.execute(
            sa.insert(user_table).values(
                id=user_seed["id"],
                email=user_seed["email"],
                full_name=user_seed["full_name"],
                role=user_seed["role"],
                status=user_seed["status"],
                is_active=user_seed["is_active"],
                is_superuser=user_seed["is_superuser"],
                hashed_password=_get_password_hash(user_seed["password"]),
                created_at=now,
            )
        )

    admin_id = _seed_uuid("user-admin")
    existing_categories = {
        (row[0], row[1])
        for row in connection.execute(
            sa.select(category_table.c.name, category_table.c.type)
        ).all()
    }
    for category_seed in CATEGORY_SEEDS:
        category_key = (category_seed["name"], category_seed["type"])
        if category_key in existing_categories:
            continue
        connection.execute(
            sa.insert(category_table).values(
                id=category_seed["id"],
                name=category_seed["name"],
                type=category_seed["type"],
                created_by=admin_id,
            )
        )

    existing_transaction_ids = {
        row[0]
        for row in connection.execute(sa.select(transaction_table.c.id)).all()
    }
    category_ids = {
        row[0]: row[1]
        for row in connection.execute(
            sa.select(category_table.c.name, category_table.c.id)
        ).all()
    }
    user_ids = {
        row[0]: row[1]
        for row in connection.execute(
            sa.select(user_table.c.email, user_table.c.id)
        ).all()
    }
    for transaction_seed in TRANSACTION_SEEDS:
        if transaction_seed["id"] in existing_transaction_ids:
            continue
        connection.execute(
            sa.insert(transaction_table).values(
                id=transaction_seed["id"],
                owner_id=user_ids[transaction_seed["email"]],
                category_id=category_ids[transaction_seed["category"]],
                amount=transaction_seed["amount"],
                type=transaction_seed["type"],
                note=transaction_seed["note"],
                date=now - timedelta(days=transaction_seed["days_back"]),
                created_at=now,
            )
        )


def downgrade() -> None:
    connection = op.get_bind()
    for transaction_seed in TRANSACTION_SEEDS:
        connection.execute(
            sa.delete(transaction_table).where(transaction_table.c.id == transaction_seed["id"])
        )
    for category_seed in CATEGORY_SEEDS:
        connection.execute(
            sa.delete(category_table).where(category_table.c.id == category_seed["id"])
        )
    for user_seed in USER_SEEDS:
        connection.execute(
            sa.delete(user_table).where(user_table.c.id == user_seed["id"])
        )
