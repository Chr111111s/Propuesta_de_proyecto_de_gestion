from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers.dashboard import router as dashboard_router
from app.routers.distribution import router as distribution_router
from app.routers.inventory import router as inventory_router
from app.routers.movements import router as movements_router

app = FastAPI(
    title="PiñaLog 360 API",
    description="API para control de inventario y distribución estatal de piñas.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def root() -> dict:
    return {"message": "PiñaLog 360 API operativa"}


app.include_router(dashboard_router)
app.include_router(inventory_router)
app.include_router(movements_router)
app.include_router(distribution_router)
