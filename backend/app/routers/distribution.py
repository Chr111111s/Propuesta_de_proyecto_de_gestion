from __future__ import annotations

from fastapi import APIRouter

from app.schemas.logistics import DistributionStateSummary, Route, RouteCreate
from app.services.repository import create_route, get_distribution_state_summary, list_routes

router = APIRouter(prefix="/distribution", tags=["distribution"])


@router.get("/routes", response_model=list[Route])
def read_routes() -> list[dict]:
    return list_routes()


@router.get("/summary/states", response_model=list[DistributionStateSummary])
def read_distribution_state_summary() -> list[dict]:
    return get_distribution_state_summary()


@router.post("/routes", response_model=Route)
def add_route(route: RouteCreate) -> dict:
    return create_route(route)
