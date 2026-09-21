from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class InventoryItem(BaseModel):
    id: int
    product_name: str
    batch_code: str
    origin: str
    state: str
    quantity: int
    volume_m3: float
    warehouse_location: str
    entry_date: str
    status: str


class MovementBase(BaseModel):
    folio: str = Field(min_length=4)
    movement_type: Literal["entrada", "salida"]
    partner: str
    quantity: int = Field(gt=0)
    volume_m3: float = Field(gt=0)
    state: str
    travel_time_hours: float = Field(ge=0)
    responsible: str
    movement_date: str
    batch_code: str
    notes: str = ""


class MovementCreate(MovementBase):
    product_name: str
    origin: str
    warehouse_location: str
    status: str


class Movement(MovementBase):
    id: int


class LogisticsTemplateRow(BaseModel):
    movement_date: str
    folio: str
    provider_or_destination: str
    quantity: int
    volume_m3: float
    state: str
    travel_time_hours: float
    responsible: str
    movement_type: Literal["entrada", "salida"]
    batch_code: str


class RouteBase(BaseModel):
    state_name: str
    destination: str
    travel_time_hours: float = Field(ge=0)
    status: str
    responsible: str
    capacity_units: int = Field(gt=0)
    last_maintenance: str


class RouteCreate(RouteBase):
    pass


class Route(RouteBase):
    id: int


class DistributionStateSummary(BaseModel):
    state_name: str
    route_count: int
    active_routes: int
    maintenance_routes: int
    total_capacity_units: int
    average_travel_time_hours: float


class DashboardMetrics(BaseModel):
    total_units: int
    total_volume_m3: float
    active_routes: int
    monthly_movements: int
    estimated_waste_reduction_pct: float
