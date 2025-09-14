from fastapi import FastAPI, Depends, HTTPException, status, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

from .database import get_db, engine
from .models import Base
from .schemas import *
from .crud import (
    UserCRUD, ProjectCRUD, MaterialCRUD, EquipmentCRUD, LabourRoleCRUD,
    ProjectMaterialCRUD, ProjectEquipmentCRUD, ProjectLaborCRUD,
    NotificationCRUD, SystemConfigCRUD, AuditLogCRUD, DashboardCRUD,
    QuoteCRUD, QuoteItemCRUD, AdvancedSearchCRUD, AdminDashboardCRUD, BulkOperationsCRUD
)

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="SLC Project Management API",
    description="Comprehensive API for SLC Project Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Dependency to get current user (simplified for demo)
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In a real application, you would validate the JWT token here
    # For demo purposes, we'll return a mock user
    return {"id": "demo-user-id", "role": "admin"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# ==================== USER ENDPOINTS ====================
@app.get("/users", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all users with pagination"""
    users = UserCRUD.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get a specific user by ID"""
    user = UserCRUD.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user"""
    # Check if user already exists
    existing_user = UserCRUD.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = UserCRUD.get_user_by_username(db, user.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Hash password (in real app, use proper password hashing)
    hashed_password = f"hashed_{user.password}"  # Simplified for demo
    
    db_user = UserCRUD.create_user(db, user, hashed_password)
    return db_user

# ==================== PROJECT ENDPOINTS ====================
@app.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[ProjectStatus] = Query(None),
    priority: Optional[ProjectPriority] = Query(None),
    manager_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get projects with optional filtering"""
    filters = SearchFilters(
        search_term=search,
        status=status,
        priority=priority,
        manager_id=manager_id,
        category=category
    )
    projects = ProjectCRUD.get_projects(db, skip=skip, limit=limit, filters=filters)
    return projects

@app.get("/projects/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: str = Path(..., description="Project ID"),
    db: Session = Depends(get_db)
):
    """Get a specific project with all details"""
    project = ProjectCRUD.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.post("/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    db_project = ProjectCRUD.create_project(db, project)
    return db_project

@app.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str = Path(..., description="Project ID"),
    project_update: ProjectUpdate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project"""
    db_project = ProjectCRUD.update_project(db, project_id, project_update)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@app.delete("/projects/{project_id}")
async def delete_project(
    project_id: str = Path(..., description="Project ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project"""
    success = ProjectCRUD.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

@app.get("/projects/{project_id}/totals")
async def get_project_totals(
    project_id: str = Path(..., description="Project ID"),
    db: Session = Depends(get_db)
):
    """Get project cost totals"""
    totals = ProjectCRUD.calculate_project_totals(db, project_id)
    if not totals:
        raise HTTPException(status_code=404, detail="Project not found")
    return totals

@app.get("/projects/recent", response_model=List[ProjectResponse])
async def get_recent_projects(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get recent projects"""
    projects = ProjectCRUD.get_recent_projects(db, limit=limit)
    return projects

# ==================== MATERIAL ENDPOINTS ====================
@app.get("/materials", response_model=List[MaterialResponse])
async def get_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get materials with optional search"""
    materials = MaterialCRUD.get_materials(db, skip=skip, limit=limit, search=search)
    return materials

@app.get("/materials/{material_id}", response_model=MaterialResponse)
async def get_material(
    material_id: str = Path(..., description="Material ID"),
    db: Session = Depends(get_db)
):
    """Get a specific material"""
    material = MaterialCRUD.get_material(db, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@app.post("/materials", response_model=MaterialResponse)
async def create_material(
    material: MaterialCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new material"""
    db_material = MaterialCRUD.create_material(db, material)
    return db_material

@app.put("/materials/{material_id}", response_model=MaterialResponse)
async def update_material(
    material_id: str = Path(..., description="Material ID"),
    material_update: MaterialUpdate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a material"""
    db_material = MaterialCRUD.update_material(db, material_id, material_update)
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    return db_material

@app.delete("/materials/{material_id}")
async def delete_material(
    material_id: str = Path(..., description="Material ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a material (soft delete)"""
    success = MaterialCRUD.delete_material(db, material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted successfully"}

# ==================== EQUIPMENT ENDPOINTS ====================
@app.get("/equipment", response_model=List[EquipmentResponse])
async def get_equipment(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get equipment with optional search"""
    equipment = EquipmentCRUD.get_equipment_list(db, skip=skip, limit=limit, search=search)
    return equipment

@app.get("/equipment/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment_item(
    equipment_id: str = Path(..., description="Equipment ID"),
    db: Session = Depends(get_db)
):
    """Get a specific equipment item"""
    equipment = EquipmentCRUD.get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@app.post("/equipment", response_model=EquipmentResponse)
async def create_equipment(
    equipment: EquipmentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new equipment"""
    db_equipment = EquipmentCRUD.create_equipment(db, equipment)
    return db_equipment

@app.put("/equipment/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: str = Path(..., description="Equipment ID"),
    equipment_update: EquipmentUpdate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update equipment"""
    db_equipment = EquipmentCRUD.update_equipment(db, equipment_id, equipment_update)
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return db_equipment

@app.delete("/equipment/{equipment_id}")
async def delete_equipment(
    equipment_id: str = Path(..., description="Equipment ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete equipment (soft delete)"""
    success = EquipmentCRUD.delete_equipment(db, equipment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted successfully"}

# ==================== LABOUR ROLE ENDPOINTS ====================
@app.get("/labour-roles", response_model=List[LabourRoleResponse])
async def get_labour_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    state_code: Optional[StateCode] = Query(None),
    db: Session = Depends(get_db)
):
    """Get labour roles with optional state filtering"""
    labour_roles = LabourRoleCRUD.get_labour_roles(db, skip=skip, limit=limit, state_code=state_code)
    return labour_roles

@app.get("/labour-roles/{role_id}", response_model=LabourRoleResponse)
async def get_labour_role(
    role_id: str = Path(..., description="Labour Role ID"),
    db: Session = Depends(get_db)
):
    """Get a specific labour role"""
    labour_role = LabourRoleCRUD.get_labour_role(db, role_id)
    if not labour_role:
        raise HTTPException(status_code=404, detail="Labour role not found")
    return labour_role

@app.post("/labour-roles", response_model=LabourRoleResponse)
async def create_labour_role(
    labour_role: LabourRoleCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new labour role"""
    db_labour_role = LabourRoleCRUD.create_labour_role(db, labour_role)
    return db_labour_role

@app.put("/labour-roles/{role_id}", response_model=LabourRoleResponse)
async def update_labour_role(
    role_id: str = Path(..., description="Labour Role ID"),
    labour_role_update: LabourRoleUpdate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a labour role"""
    db_labour_role = LabourRoleCRUD.update_labour_role(db, role_id, labour_role_update)
    if not db_labour_role:
        raise HTTPException(status_code=404, detail="Labour role not found")
    return db_labour_role

@app.delete("/labour-roles/{role_id}")
async def delete_labour_role(
    role_id: str = Path(..., description="Labour Role ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a labour role (soft delete)"""
    success = LabourRoleCRUD.delete_labour_role(db, role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Labour role not found")
    return {"message": "Labour role deleted successfully"}

@app.get("/labour-roles/rate/{labour_type}/{state_code}")
async def get_effective_rate(
    labour_type: str = Path(..., description="Labour Type"),
    state_code: StateCode = Path(..., description="State Code"),
    db: Session = Depends(get_db)
):
    """Get effective labour rate for a specific type and state"""
    rate = LabourRoleCRUD.get_effective_rate(db, labour_type, state_code)
    return {"labour_type": labour_type, "state_code": state_code, "effective_rate": rate}

# ==================== PROJECT COMPONENT ENDPOINTS ====================
@app.post("/projects/{project_id}/materials", response_model=ProjectMaterialResponse)
async def add_material_to_project(
    project_id: str = Path(..., description="Project ID"),
    project_material: ProjectMaterialCreate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add material to project"""
    project_material.project_id = project_id
    db_project_material = ProjectMaterialCRUD.add_material_to_project(db, project_material)
    return db_project_material

@app.delete("/projects/{project_id}/materials/{material_id}")
async def remove_material_from_project(
    project_id: str = Path(..., description="Project ID"),
    material_id: str = Path(..., description="Material ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove material from project"""
    success = ProjectMaterialCRUD.remove_material_from_project(db, project_id, material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found in project")
    return {"message": "Material removed from project"}

@app.post("/projects/{project_id}/equipment", response_model=ProjectEquipmentResponse)
async def add_equipment_to_project(
    project_id: str = Path(..., description="Project ID"),
    project_equipment: ProjectEquipmentCreate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add equipment to project"""
    project_equipment.project_id = project_id
    db_project_equipment = ProjectEquipmentCRUD.add_equipment_to_project(db, project_equipment)
    return db_project_equipment

@app.delete("/projects/{project_id}/equipment/{equipment_id}")
async def remove_equipment_from_project(
    project_id: str = Path(..., description="Project ID"),
    equipment_id: str = Path(..., description="Equipment ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove equipment from project"""
    success = ProjectEquipmentCRUD.remove_equipment_from_project(db, project_id, equipment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Equipment not found in project")
    return {"message": "Equipment removed from project"}

@app.post("/projects/{project_id}/labor", response_model=ProjectLaborResponse)
async def add_labor_to_project(
    project_id: str = Path(..., description="Project ID"),
    project_labor: ProjectLaborCreate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add labor to project"""
    project_labor.project_id = project_id
    db_project_labor = ProjectLaborCRUD.add_labor_to_project(db, project_labor)
    return db_project_labor

@app.delete("/projects/{project_id}/labor/{labor_id}")
async def remove_labor_from_project(
    project_id: str = Path(..., description="Project ID"),
    labor_id: str = Path(..., description="Labor ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove labor from project"""
    success = ProjectLaborCRUD.remove_labor_from_project(db, project_id, labor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Labor not found in project")
    return {"message": "Labor removed from project"}

# ==================== NOTIFICATION ENDPOINTS ====================
@app.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    user_id: str = Query(..., description="User ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get user notifications"""
    notifications = NotificationCRUD.get_notifications(db, user_id, skip=skip, limit=limit)
    return notifications

@app.get("/notifications/unread", response_model=List[NotificationResponse])
async def get_unread_notifications(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get unread notifications for user"""
    notifications = NotificationCRUD.get_unread_notifications(db, user_id)
    return notifications

@app.post("/notifications", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notification"""
    db_notification = NotificationCRUD.create_notification(db, notification)
    return db_notification

@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str = Path(..., description="Notification ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    success = NotificationCRUD.mark_notification_read(db, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@app.put("/notifications/read-all")
async def mark_all_notifications_read(
    user_id: str = Query(..., description="User ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for user"""
    updated_count = NotificationCRUD.mark_all_notifications_read(db, user_id)
    return {"message": f"{updated_count} notifications marked as read"}

# ==================== DASHBOARD ENDPOINTS ====================
@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    stats = DashboardCRUD.get_dashboard_stats(db)
    return stats

# ==================== SYSTEM CONFIG ENDPOINTS ====================
@app.get("/config", response_model=List[SystemConfigResponse])
async def get_system_configs(
    db: Session = Depends(get_db)
):
    """Get all system configurations"""
    configs = SystemConfigCRUD.get_configs(db)
    return configs

@app.get("/config/{key}", response_model=SystemConfigResponse)
async def get_system_config(
    key: str = Path(..., description="Config Key"),
    db: Session = Depends(get_db)
):
    """Get a specific system configuration"""
    config = SystemConfigCRUD.get_config(db, key)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@app.post("/config", response_model=SystemConfigResponse)
async def create_system_config(
    config: SystemConfigCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new system configuration"""
    db_config = SystemConfigCRUD.create_config(db, config)
    return db_config

@app.put("/config/{key}", response_model=SystemConfigResponse)
async def update_system_config(
    key: str = Path(..., description="Config Key"),
    config_update: SystemConfigUpdate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a system configuration"""
    db_config = SystemConfigCRUD.update_config(db, key, config_update)
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return db_config

# ==================== PRICE CHANGE LOG ENDPOINTS ====================
@app.get("/price-changes", response_model=List[PriceChangeLogResponse])
async def get_price_changes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    entity_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get price change logs"""
    # This would need to be implemented in CRUD
    return []

# ==================== AUDIT LOG ENDPOINTS ====================
@app.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get audit logs"""
    audit_logs = AuditLogCRUD.get_audit_logs(db, skip=skip, limit=limit, user_id=user_id)
    return audit_logs

# ==================== QUOTE ENDPOINTS ====================
@app.get("/quotes", response_model=List[QuoteResponse])
async def get_quotes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get quotes with optional search"""
    quotes = QuoteCRUD.get_quotes(db, skip=skip, limit=limit, search=search)
    return quotes

@app.get("/quotes/{quote_id}", response_model=QuoteResponse)
async def get_quote(
    quote_id: str = Path(..., description="Quote ID"),
    db: Session = Depends(get_db)
):
    """Get a specific quote with all details"""
    quote = QuoteCRUD.get_quote(db, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote

@app.post("/quotes", response_model=QuoteResponse)
async def create_quote(
    quote: QuoteCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new quote"""
    # Generate quote number if not provided
    if not quote.quote_number:
        quote.quote_number = QuoteCRUD.generate_quote_number(db)
    
    db_quote = QuoteCRUD.create_quote(db, quote, current_user["id"])
    return db_quote

@app.put("/quotes/{quote_id}", response_model=QuoteResponse)
async def update_quote(
    quote_id: str = Path(..., description="Quote ID"),
    quote_update: QuoteUpdate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a quote"""
    db_quote = QuoteCRUD.update_quote(db, quote_id, quote_update)
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return db_quote

@app.delete("/quotes/{quote_id}")
async def delete_quote(
    quote_id: str = Path(..., description="Quote ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a quote"""
    success = QuoteCRUD.delete_quote(db, quote_id)
    if not success:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted successfully"}

@app.get("/quotes/{quote_id}/items", response_model=List[QuoteItemResponse])
async def get_quote_items(
    quote_id: str = Path(..., description="Quote ID"),
    db: Session = Depends(get_db)
):
    """Get quote items"""
    items = QuoteItemCRUD.get_quote_items(db, quote_id)
    return items

@app.post("/quotes/{quote_id}/items", response_model=QuoteItemResponse)
async def add_quote_item(
    quote_id: str = Path(..., description="Quote ID"),
    item: QuoteItemCreate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to quote"""
    db_item = QuoteItemCRUD.create_quote_item(db, quote_id, item)
    return db_item

@app.put("/quotes/{quote_id}/items/{item_id}", response_model=QuoteItemResponse)
async def update_quote_item(
    quote_id: str = Path(..., description="Quote ID"),
    item_id: str = Path(..., description="Item ID"),
    item_update: QuoteItemUpdate = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update quote item"""
    db_item = QuoteItemCRUD.update_quote_item(db, item_id, item_update)
    if not db_item:
        raise HTTPException(status_code=404, detail="Quote item not found")
    return db_item

@app.delete("/quotes/{quote_id}/items/{item_id}")
async def delete_quote_item(
    quote_id: str = Path(..., description="Quote ID"),
    item_id: str = Path(..., description="Item ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete quote item"""
    success = QuoteItemCRUD.delete_quote_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Quote item not found")
    return {"message": "Quote item deleted successfully"}

# ==================== CALCULATOR ENDPOINTS ====================
@app.post("/calculator/rate-card", response_model=CalculatorResponse)
async def calculate_rate_card(
    request: CalculatorRequest,
    db: Session = Depends(get_db)
):
    """Calculate rate card based on region and selections"""
    # This is a simplified calculation - you can expand this based on your business logic
    base_amount = 1000.0  # Base rate
    support_amount = len(request.additional_support) * 100.0  # Support items
    
    # Apply risk uplift
    risk_multiplier = 1 + (request.risk_uplift / 100)
    subtotal = (base_amount + support_amount) * risk_multiplier
    
    # Add tax (assuming 10% GST)
    tax_rate = 10.0
    tax_amount = subtotal * (tax_rate / 100)
    total_amount = subtotal + tax_amount
    
    return CalculatorResponse(
        base_amount=base_amount,
        support_amount=support_amount,
        subtotal=subtotal,
        total_amount=total_amount,
        breakdown={
            "base_rate": base_amount,
            "support_items": support_amount,
            "risk_uplift_percent": request.risk_uplift,
            "risk_multiplier": risk_multiplier,
            "tax_rate": tax_rate,
            "tax_amount": tax_amount,
            "sor_code": request.sor_code,
            "sor_description": request.sor_description
        }
    )

# ==================== ADMIN DASHBOARD ENDPOINTS ====================
@app.get("/admin/dashboard/stats", response_model=AdminDashboardStats)
async def get_admin_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    return AdminDashboardCRUD.get_dashboard_stats(db)

@app.get("/admin/projects", response_model=List[AdminProjectSummary])
async def get_admin_projects(
    search_term: Optional[str] = Query(None),
    status: Optional[ProjectStatus] = Query(None),
    priority: Optional[ProjectPriority] = Query(None),
    region: Optional[str] = Query(None),
    sor_type: Optional[str] = Query(None),
    manager_id: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    budget_min: Optional[float] = Query(None),
    budget_max: Optional[float] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get projects for admin dashboard with advanced filtering"""
    search_request = AdminSearchRequest(
        search_term=search_term,
        status=status,
        priority=priority,
        region=region,
        sor_type=sor_type,
        manager_id=manager_id,
        date_from=date_from,
        date_to=date_to,
        budget_min=budget_min,
        budget_max=budget_max
    )
    return AdminDashboardCRUD.get_admin_projects(db, search_request, skip, limit)

@app.get("/admin/activity-feed", response_model=ActivityFeedResponse)
async def get_admin_activity_feed(
    user_id: str = Query(..., description="User ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity feed for admin dashboard"""
    return AdminDashboardCRUD.get_activity_feed(db, user_id, skip, limit)

# ==================== BULK OPERATIONS ENDPOINTS ====================
@app.post("/bulk/import", response_model=BulkImportResponse)
async def bulk_import(
    request: BulkImportRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bulk import data"""
    return BulkOperationsCRUD.bulk_import(db, request)

@app.post("/bulk/export", response_model=BulkExportResponse)
async def bulk_export(
    request: BulkExportRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bulk export data"""
    return BulkOperationsCRUD.bulk_export(db, request)

# ==================== ENHANCED SEARCH ENDPOINTS ====================
@app.get("/search/projects", response_model=List[ProjectResponse])
async def search_projects(
    search_term: Optional[str] = Query(None),
    status: Optional[ProjectStatus] = Query(None),
    priority: Optional[ProjectPriority] = Query(None),
    manager_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    sor_type: Optional[str] = Query(None),
    sor_code: Optional[str] = Query(None),
    start_date_from: Optional[datetime] = Query(None),
    start_date_to: Optional[datetime] = Query(None),
    budget_min: Optional[float] = Query(None),
    budget_max: Optional[float] = Query(None),
    progress_min: Optional[int] = Query(None),
    progress_max: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Advanced search for projects"""
    filters = AdvancedSearchFilters(
        search_term=search_term,
        status=status,
        priority=priority,
        manager_id=manager_id,
        category=category,
        region=region,
        sor_type=sor_type,
        sor_code=sor_code,
        start_date_from=start_date_from,
        start_date_to=start_date_to,
        budget_min=budget_min,
        budget_max=budget_max,
        progress_min=progress_min,
        progress_max=progress_max
    )
    return AdvancedSearchCRUD.search_projects(db, filters, skip, limit)

@app.get("/search/materials", response_model=List[MaterialResponse])
async def search_materials(
    search_term: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    site: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Enhanced search for materials"""
    materials = MaterialCRUD.get_materials(db, skip=skip, limit=limit, search=search_term)
    return materials

@app.get("/search/equipment", response_model=List[EquipmentResponse])
async def search_equipment(
    search_term: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    site: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Enhanced search for equipment"""
    equipment = EquipmentCRUD.get_equipment_list(db, skip=skip, limit=limit, search=search_term)
    return equipment

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )