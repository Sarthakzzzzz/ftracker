import uuid

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import CurrentUser, SessionDep, get_current_admin, require_roles
from app.crud.category import (
    create_category,
    delete_category,
    get_categories,
    get_category,
    update_category,
)
from app.models.category import (
    CategoriesPublic,
    CategoryCreate,
    CategoryPublic,
    CategoryUpdate,
)
from app.models.common import Message
from app.models.users import UserRole

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get(
    "/",
    dependencies=[Depends(require_roles(UserRole.viewer, UserRole.analyst, UserRole.admin))],
    response_model=CategoriesPublic,
)
def read_categories(
    session: SessionDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
) -> CategoriesPublic:
    categories = get_categories(session=session, skip=skip, limit=limit)
    all_count = len(get_categories(session=session, skip=0, limit=5000))
    return CategoriesPublic(
        data=[CategoryPublic.model_validate(category) for category in categories],
        count=all_count,
    )


@router.post("/", dependencies=[Depends(get_current_admin)], response_model=CategoryPublic)
def create_category_route(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    category_in: CategoryCreate,
) -> CategoryPublic:
    category = create_category(
        session=session,
        category_in=category_in,
        created_by=current_user.id,
    )
    return CategoryPublic.model_validate(category)


@router.patch("/{category_id}", dependencies=[Depends(get_current_admin)], response_model=CategoryPublic)
def update_category_route(
    *,
    session: SessionDep,
    category_id: uuid.UUID,
    category_in: CategoryUpdate,
) -> CategoryPublic:
    category = get_category(session=session, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    updated = update_category(session=session, db_category=category, category_in=category_in)
    return CategoryPublic.model_validate(updated)


@router.delete("/{category_id}", dependencies=[Depends(get_current_admin)], response_model=Message)
def delete_category_route(*, session: SessionDep, category_id: uuid.UUID) -> Message:
    category = get_category(session=session, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.transactions:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category with existing transactions",
        )

    delete_category(session=session, db_category=category)
    return Message(message="Category deleted successfully")
