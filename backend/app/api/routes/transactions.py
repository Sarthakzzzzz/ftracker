import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import CurrentUser, SessionDep, get_current_admin, require_roles
from app.crud.category import get_category
from app.crud.transactions import (
    create_transaction,
    delete_transaction,
    get_transaction,
    get_transactions,
    update_transaction,
)
from app.models.common import Message
from app.models.transactions import (
    TransactionCreate,
    TransactionPublic,
    TransactionsPublic,
    TransactionType,
    TransactionUpdate,
)
from app.models.users import UserRole

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get(
    "/",
    dependencies=[Depends(require_roles(UserRole.viewer, UserRole.analyst, UserRole.admin))],
    response_model=TransactionsPublic,
)
def read_transactions(
    session: SessionDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    category_id: uuid.UUID | None = None,
    type: TransactionType | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> TransactionsPublic:
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be greater than end_date")

    records, count = get_transactions(
        session=session,
        skip=skip,
        limit=limit,
        category_id=category_id,
        txn_type=type,
        start_date=start_date,
        end_date=end_date,
    )
    return TransactionsPublic(
        data=[TransactionPublic.model_validate(record) for record in records],
        count=count,
    )


@router.get(
    "/{transaction_id}",
    dependencies=[Depends(require_roles(UserRole.viewer, UserRole.analyst, UserRole.admin))],
    response_model=TransactionPublic,
)
def read_transaction(transaction_id: uuid.UUID, session: SessionDep) -> TransactionPublic:
    record = get_transaction(session=session, transaction_id=transaction_id)
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return TransactionPublic.model_validate(record)


@router.post("/", dependencies=[Depends(get_current_admin)], response_model=TransactionPublic)
def create_transaction_route(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    transaction_in: TransactionCreate,
) -> TransactionPublic:
    category = get_category(session=session, category_id=transaction_in.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.type != transaction_in.type:
        raise HTTPException(
            status_code=400,
            detail="Category type does not match transaction type",
        )

    transaction = create_transaction(
        session=session,
        owner_id=current_user.id,
        transaction_in=transaction_in,
    )
    return TransactionPublic.model_validate(transaction)


@router.patch("/{transaction_id}", dependencies=[Depends(get_current_admin)], response_model=TransactionPublic)
def update_transaction_route(
    *,
    session: SessionDep,
    transaction_id: uuid.UUID,
    transaction_in: TransactionUpdate,
) -> TransactionPublic:
    record = get_transaction(session=session, transaction_id=transaction_id)
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")

    category_id = transaction_in.category_id if transaction_in.category_id else record.category_id
    txn_type = transaction_in.type if transaction_in.type else record.type

    category = get_category(session=session, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.type != txn_type:
        raise HTTPException(
            status_code=400,
            detail="Category type does not match transaction type",
        )

    updated = update_transaction(
        session=session,
        db_transaction=record,
        transaction_in=transaction_in,
    )
    return TransactionPublic.model_validate(updated)


@router.delete("/{transaction_id}", dependencies=[Depends(get_current_admin)], response_model=Message)
def delete_transaction_route(*, session: SessionDep, transaction_id: uuid.UUID) -> Message:
    record = get_transaction(session=session, transaction_id=transaction_id)
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")

    delete_transaction(session=session, db_transaction=record)
    return Message(message="Transaction deleted successfully")
