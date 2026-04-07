import uuid
from datetime import date, datetime, time, timezone

from sqlmodel import Session, col, select

from app.models.transactions import (
    Transaction,
    TransactionCreate,
    TransactionType,
    TransactionUpdate,
)


def create_transaction(*, session: Session, owner_id: uuid.UUID, transaction_in: TransactionCreate) -> Transaction:
    db_transaction = Transaction.model_validate(
        transaction_in,
        update={"owner_id": owner_id},
    )
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction


def get_transaction(*, session: Session, transaction_id: uuid.UUID) -> Transaction | None:
    return session.get(Transaction, transaction_id)


def get_transactions(
    *,
    session: Session,
    skip: int = 0,
    limit: int = 100,
    category_id: uuid.UUID | None = None,
    txn_type: TransactionType | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> tuple[list[Transaction], int]:
    statement = select(Transaction)

    if category_id:
        statement = statement.where(col(Transaction.category_id) == category_id)
    if txn_type:
        statement = statement.where(col(Transaction.type) == txn_type)
    if start_date:
        start_dt = datetime.combine(start_date, time.min).replace(tzinfo=timezone.utc)
        statement = statement.where(col(Transaction.date) >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, time.max).replace(tzinfo=timezone.utc)
        statement = statement.where(col(Transaction.date) <= end_dt)

    all_records = list(session.exec(statement.order_by(col(Transaction.date).desc())).all())
    count = len(all_records)
    return all_records[skip : skip + limit], count


def update_transaction(*, session: Session, db_transaction: Transaction, transaction_in: TransactionUpdate) -> Transaction:
    update_data = transaction_in.model_dump(exclude_unset=True)
    db_transaction.sqlmodel_update(update_data)
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction


def delete_transaction(*, session: Session, db_transaction: Transaction) -> None:
    session.delete(db_transaction)
    session.commit()
