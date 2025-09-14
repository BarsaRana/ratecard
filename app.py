# fastapi-backend/app.py
from __future__ import annotations
from typing import List

from fastapi import FastAPI, Depends, Request, Response, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from . import crud_new as crud
from . import schemas
from .database import get_db, test_connection
from . import models

# -----------------------------------------------------------------------------
# Create app FIRST
# -----------------------------------------------------------------------------
app = FastAPI(title="Rate Card API", version="1.0")

# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "*"  # tighten in prod
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Startup DB check
# -----------------------------------------------------------------------------
@app.on_event("startup")
def _check_db() -> None:
    err = test_connection()
    print("DB connection OK" if not err else f"DB connection FAILED: {err}")

# -----------------------------------------------------------------------------
# Health & misc
# -----------------------------------------------------------------------------
@app.get("/health", response_model=schemas.HealthResponse)
def health(db: Session = Depends(get_db)) -> schemas.HealthResponse:
    try:
        db.execute(text("SELECT 1"))
        return schemas.HealthResponse(status="ok")
    except Exception as e:
        return schemas.HealthResponse(status="db_error", detail=str(e))

@app.get("/favicon.ico", include_in_schema=False)
async def favicon() -> Response:
    return Response(status_code=204)

# -----------------------------------------------------------------------------
# Validation logging
# -----------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("VALIDATION ERROR on", request.url.path, ":", exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# -----------------------------------------------------------------------------
# Material endpoints
# -----------------------------------------------------------------------------
@app.post("/materials/", response_model=schemas.MaterialResponse, status_code=201)
def create_material(material: schemas.MaterialCreate, db: Session = Depends(get_db)):
    return crud.create_material(db=db, material=material)

@app.get("/materials/", response_model=List[schemas.MaterialResponse])
def read_materials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    materials = crud.get_materials(db, skip=skip, limit=limit)
    return materials

@app.get("/materials/{material_id}", response_model=schemas.MaterialResponse)
def read_material(material_id: int, db: Session = Depends(get_db)):
    db_material = crud.get_material(db, material_id=material_id)
    if db_material is None:
        raise HTTPException(status_code=404, detail="Material not found")
    return db_material

@app.put("/materials/{material_id}", response_model=schemas.MaterialResponse)
def update_material(material_id: int, material: schemas.MaterialUpdate, db: Session = Depends(get_db)):
    db_material = crud.update_material(db, material_id=material_id, material=material)
    if db_material is None:
        raise HTTPException(status_code=404, detail="Material not found")
    return db_material

@app.delete("/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    success = crud.delete_material(db, material_id=material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted successfully"}

@app.post("/materials/search/", response_model=List[schemas.MaterialResponse])
def search_materials(search: schemas.MaterialSearch, db: Session = Depends(get_db)):
    return crud.search_materials(db, search=search)

# -----------------------------------------------------------------------------
# Equipment endpoints
# -----------------------------------------------------------------------------
@app.post("/equipment/", response_model=schemas.EquipmentResponse, status_code=201)
def create_equipment(equipment: schemas.EquipmentCreate, db: Session = Depends(get_db)):
    return crud.create_equipment(db=db, equipment=equipment)

@app.get("/equipment/", response_model=List[schemas.EquipmentResponse])
def read_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    equipment = crud.get_equipment_list(db, skip=skip, limit=limit)
    return equipment

@app.get("/equipment/{equipment_id}", response_model=schemas.EquipmentResponse)
def read_equipment_item(equipment_id: int, db: Session = Depends(get_db)):
    db_equipment = crud.get_equipment(db, equipment_id=equipment_id)
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return db_equipment

@app.put("/equipment/{equipment_id}", response_model=schemas.EquipmentResponse)
def update_equipment(equipment_id: int, equipment: schemas.EquipmentUpdate, db: Session = Depends(get_db)):
    db_equipment = crud.update_equipment(db, equipment_id=equipment_id, equipment=equipment)
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return db_equipment

@app.delete("/equipment/{equipment_id}")
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    success = crud.delete_equipment(db, equipment_id=equipment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted successfully"}

@app.post("/equipment/search/", response_model=List[schemas.EquipmentResponse])
def search_equipment(search: schemas.EquipmentSearch, db: Session = Depends(get_db)):
    return crud.search_equipment(db, search=search)

# -----------------------------------------------------------------------------
# Labour Rate endpoints
# -----------------------------------------------------------------------------
@app.post("/labour-rates/", response_model=schemas.LabourRateResponse, status_code=201)
def create_labour_rate(labour_rate: schemas.LabourRateCreate, db: Session = Depends(get_db)):
    return crud.create_labour_rate(db=db, labour_rate=labour_rate)

@app.get("/labour-rates/", response_model=List[schemas.LabourRateResponse])
def read_labour_rates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    labour_rates = crud.get_labour_rates(db, skip=skip, limit=limit)
    return labour_rates

@app.get("/labour-rates/state/{state_code}", response_model=List[schemas.LabourRateResponse])
def read_labour_rates_by_state(state_code: str, db: Session = Depends(get_db)):
    labour_rates = crud.get_labour_rates_by_state(db, state_code=state_code)
    return labour_rates

@app.get("/labour-rates/{labour_rate_id}", response_model=schemas.LabourRateResponse)
def read_labour_rate(labour_rate_id: int, db: Session = Depends(get_db)):
    db_labour_rate = crud.get_labour_rate(db, labour_rate_id=labour_rate_id)
    if db_labour_rate is None:
        raise HTTPException(status_code=404, detail="Labour rate not found")
    return db_labour_rate

@app.put("/labour-rates/{labour_rate_id}", response_model=schemas.LabourRateResponse)
def update_labour_rate(labour_rate_id: int, labour_rate: schemas.LabourRateUpdate, db: Session = Depends(get_db)):
    db_labour_rate = crud.update_labour_rate(db, labour_rate_id=labour_rate_id, labour_rate=labour_rate)
    if db_labour_rate is None:
        raise HTTPException(status_code=404, detail="Labour rate not found")
    return db_labour_rate

@app.delete("/labour-rates/{labour_rate_id}")
def delete_labour_rate(labour_rate_id: int, db: Session = Depends(get_db)):
    success = crud.delete_labour_rate(db, labour_rate_id=labour_rate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Labour rate not found")
    return {"message": "Labour rate deleted successfully"}

# -----------------------------------------------------------------------------
# Statistics endpoints
# -----------------------------------------------------------------------------
@app.get("/statistics/materials/")
def get_material_statistics(db: Session = Depends(get_db)):
    return crud.get_material_statistics(db)

@app.get("/statistics/equipment/")
def get_equipment_statistics(db: Session = Depends(get_db)):
    return crud.get_equipment_statistics(db)
