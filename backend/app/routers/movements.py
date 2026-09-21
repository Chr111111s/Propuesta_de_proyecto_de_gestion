from __future__ import annotations

from fastapi import APIRouter

from app.schemas.logistics import LogisticsTemplateRow, Movement, MovementCreate
from app.services.repository import create_movement, list_logistics_template_rows, list_movements

router = APIRouter(prefix="/movements", tags=["movements"])


@router.get("", response_model=list[Movement])
def read_movements() -> list[dict]:
    return list_movements()


@router.get("/template", response_model=list[LogisticsTemplateRow])
def read_logistics_template() -> list[dict]:
    return list_logistics_template_rows()


@router.post("", response_model=Movement)
def add_movement(movement: MovementCreate) -> dict:
    return create_movement(movement)
