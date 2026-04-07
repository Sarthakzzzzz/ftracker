import uuid

from sqlmodel import Session, select

from app.models.category import Category, CategoryCreate, CategoryUpdate


def create_category(*, session: Session, category_in: CategoryCreate, created_by: uuid.UUID | None) -> Category:
    db_category = Category.model_validate(category_in, update={"created_by": created_by})
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category


def get_category(*, session: Session, category_id: uuid.UUID) -> Category | None:
    return session.get(Category, category_id)


def get_categories(*, session: Session, skip: int = 0, limit: int = 100) -> list[Category]:
    statement = select(Category).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def update_category(*, session: Session, db_category: Category, category_in: CategoryUpdate) -> Category:
    update_data = category_in.model_dump(exclude_unset=True)
    db_category.sqlmodel_update(update_data)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category


def delete_category(*, session: Session, db_category: Category) -> None:
    session.delete(db_category)
    session.commit()
