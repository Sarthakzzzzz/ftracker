from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import SessionDep, require_roles
from app.models.common import DashboardSummary
from app.models.users import UserRole
from app.services.dashboard import build_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get(
    "/summary",
    dependencies=[Depends(require_roles(UserRole.viewer, UserRole.analyst, UserRole.admin))],
    response_model=DashboardSummary,
)
def get_dashboard_summary(
    session: SessionDep,
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    recent_limit: int = Query(default=5, ge=1, le=50),
    trend_by: str = Query(default="monthly", pattern="^(monthly|weekly)$"),
) -> DashboardSummary:
    if from_date and to_date and from_date > to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be greater than to_date")

    return build_dashboard_summary(
        session=session,
        from_date=from_date,
        to_date=to_date,
        recent_limit=recent_limit,
        trend_by=trend_by,
    )
