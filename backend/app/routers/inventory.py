from __future__ import annotations

from fastapi import APIRouter

from app.schemas.logistics import InventoryItem
from app.services.repository import list_inventory

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("", response_model=list[InventoryItem])
def read_inventory() -> list[dict]:
    return list_inventory()
