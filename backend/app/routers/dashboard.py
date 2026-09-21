from __future__ import annotations

from fastapi import APIRouter

from app.schemas.logistics import DashboardMetrics
from app.services.repository import get_dashboard_metrics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
def read_metrics() -> dict:
    return get_dashboard_metrics()
