from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class ProjectStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class ProjectPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NotificationType(str, Enum):
    TASK = "task"
    PROJECT = "project"
    SYSTEM = "system"
    BUDGET = "budget"
    DEADLINE = "deadline"
    PRICE_CHANGE = "price_change"
    LABOR_OVERRUN = "labor_overrun"
    BUDGET_OVERRUN = "budget_overrun"
    OVERDUE = "overdue"
    MATERIAL_SHORTAGE = "material_shortage"
    EQUIPMENT_MAINTENANCE = "equipment_maintenance"
    QUALITY_ISSUE = "quality_issue"
    SAFETY_ALERT = "safety_alert"
    WEATHER_ALERT = "weather_alert"
    CUSTOM = "custom"

class NotificationSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class StateCode(str, Enum):
    NSW = "NSW"
    VIC = "VIC"
    QLD = "QLD"
    NT = "NT"
    SA = "SA"
    WA = "WA"
    TAS = "TAS"
    ACT = "ACT"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class QuoteStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class QuoteItemType(str, Enum):
    MATERIAL = "material"
    EQUIPMENT = "equipment"
    LABOR = "labor"
    TASK = "task"
    EXTERNAL = "external"

# Base schemas
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True
        use_enum_values = True

# Health check
class HealthResponse(BaseModel):
    status: str
    detail: Optional[str] = None

# User schemas
class UserBase(BaseSchema):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseSchema):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

# Material schemas
class MaterialBase(BaseSchema):
    sales_part_no: str = Field(..., max_length=100)
    description: str
    name: str = Field(..., max_length=100)
    state_code: str = Field(..., max_length=10)
    qty: int = Field(1, gt=0)
    unit_cost: float = Field(..., gt=0)
    image_url: Optional[str] = Field(None, max_length=500)
    sor_code: Optional[str] = Field(None, max_length=30)

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseSchema):
    sales_part_no: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    name: Optional[str] = Field(None, max_length=100)
    state_code: Optional[str] = Field(None, max_length=10)
    qty: Optional[int] = Field(None, gt=0)
    unit_cost: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = Field(None, max_length=500)
    sor_code: Optional[str] = Field(None, max_length=30)

class MaterialResponse(MaterialBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class MaterialSearch(BaseSchema):
    search_term: Optional[str] = None
    state_code: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None

# Equipment schemas
class EquipmentBase(BaseSchema):
    task_id: Optional[int] = None
    sales_part_no: str = Field(..., max_length=50)
    equipment_name: str
    category: str = Field(..., max_length=100)
    state_code: str = Field(..., max_length=100)
    price: float = Field(..., gt=0)
    price_incl_tax: float = Field(..., gt=0)
    sor_code: Optional[str] = Field(None, max_length=30)

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseSchema):
    task_id: Optional[int] = None
    sales_part_no: Optional[str] = Field(None, max_length=50)
    equipment_name: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    state_code: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    price_incl_tax: Optional[float] = Field(None, gt=0)
    sor_code: Optional[str] = Field(None, max_length=30)

class EquipmentResponse(EquipmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class EquipmentSearch(BaseSchema):
    search_term: Optional[str] = None
    category: Optional[str] = None
    state_code: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None

# Labour Rate schemas
class LabourRateBase(BaseSchema):
    labour_type: str = Field(..., max_length=100)
    cost_per_person: float = Field(..., gt=0)
    hours: float = Field(1.0, gt=0)
    state_code: str = Field(..., max_length=10)

class LabourRateCreate(LabourRateBase):
    pass

class LabourRateUpdate(BaseSchema):
    labour_type: Optional[str] = Field(None, max_length=100)
    cost_per_person: Optional[float] = Field(None, gt=0)
    hours: Optional[float] = Field(None, gt=0)
    state_code: Optional[str] = Field(None, max_length=10)

class LabourRateResponse(LabourRateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# Project schemas
class ProjectBase(BaseSchema):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    sor_code: Optional[str] = Field(None, max_length=100)
    sor_description: Optional[str] = None
    sor_type: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    status: ProjectStatus = ProjectStatus.PLANNING
    priority: ProjectPriority = ProjectPriority.MEDIUM
    budget: float = Field(0.0, ge=0)
    actual_cost: float = Field(0.0, ge=0)
    progress: int = Field(0, ge=0, le=100)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    region: Optional[str] = Field(None, max_length=50)

class ProjectCreate(ProjectBase):
    manager_id: str

class ProjectUpdate(BaseSchema):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    sor_code: Optional[str] = Field(None, max_length=100)
    sor_description: Optional[str] = None
    sor_type: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    budget: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    progress: Optional[int] = Field(None, ge=0, le=100)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    region: Optional[str] = Field(None, max_length=50)

class ProjectResponse(ProjectBase):
    id: str
    manager_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    manager_user: Optional[UserResponse] = None

# Project Component schemas
class ProjectMaterialBase(BaseSchema):
    quantity: int = Field(1, gt=0)
    unit_price: float = Field(..., gt=0)
    total_price: float = Field(..., gt=0)

class ProjectMaterialCreate(ProjectMaterialBase):
    project_id: str
    material_id: str

class ProjectMaterialResponse(ProjectMaterialBase):
    id: str
    project_id: str
    material_id: str
    created_at: datetime
    material: Optional[MaterialResponse] = None

class ProjectEquipmentBase(BaseSchema):
    quantity: int = Field(1, gt=0)
    unit_price: float = Field(..., gt=0)
    total_price: float = Field(..., gt=0)

class ProjectEquipmentCreate(ProjectEquipmentBase):
    project_id: str
    equipment_id: str

class ProjectEquipmentResponse(ProjectEquipmentBase):
    id: str
    project_id: str
    equipment_id: str
    created_at: datetime
    equipment: Optional[EquipmentResponse] = None

class ProjectLaborBase(BaseSchema):
    persons: int = Field(1, gt=0)
    hours: int = Field(8, gt=0)
    state_code: StateCode
    unit_rate: float = Field(..., gt=0)
    total_cost: float = Field(..., gt=0)

class ProjectLaborCreate(ProjectLaborBase):
    project_id: str
    labour_role_id: str

class ProjectLaborResponse(ProjectLaborBase):
    id: str
    project_id: str
    labour_role_id: str
    created_at: datetime
    labour_role: Optional[LabourRoleResponse] = None

class ProjectTaskBase(BaseSchema):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None

class ProjectTaskCreate(ProjectTaskBase):
    project_id: str

class ProjectTaskUpdate(BaseSchema):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None

class ProjectTaskResponse(ProjectTaskBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class ProjectExternalCostBase(BaseSchema):
    cost_type: str = Field(..., max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    amount: float = Field(..., ge=0)
    percentage: Optional[float] = Field(None, ge=0, le=100)
    is_enabled: bool = True

class ProjectExternalCostCreate(ProjectExternalCostBase):
    project_id: str

class ProjectExternalCostResponse(ProjectExternalCostBase):
    id: str
    project_id: str
    created_at: datetime

# Notification schemas
class NotificationBase(BaseSchema):
    type: NotificationType
    severity: NotificationSeverity = NotificationSeverity.MEDIUM
    title: str = Field(..., max_length=200)
    message: str
    related_project_id: Optional[str] = None
    related_entity_id: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: str

class NotificationUpdate(BaseSchema):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: str
    user_id: str
    is_read: bool
    created_at: datetime

# Price Change Log schemas
class PriceChangeLogBase(BaseSchema):
    entity_type: str = Field(..., max_length=50)
    entity_id: str
    entity_name: str = Field(..., max_length=200)
    old_price: float = Field(..., ge=0)
    new_price: float = Field(..., ge=0)
    change_reason: Optional[str] = None

class PriceChangeLogCreate(PriceChangeLogBase):
    changed_by: Optional[str] = None

class PriceChangeLogResponse(PriceChangeLogBase):
    id: str
    changed_by: Optional[str] = None
    created_at: datetime
    changed_by_user: Optional[UserResponse] = None

# System Config schemas
class SystemConfigBase(BaseSchema):
    key: str = Field(..., max_length=100)
    value: str
    description: Optional[str] = None

class SystemConfigCreate(SystemConfigBase):
    pass

class SystemConfigUpdate(BaseSchema):
    value: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SystemConfigResponse(SystemConfigBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

# Audit Log schemas
class AuditLogBase(BaseSchema):
    action: str = Field(..., max_length=100)
    entity_type: str = Field(..., max_length=50)
    entity_id: str
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = Field(None, max_length=45)
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[str] = None

class AuditLogResponse(AuditLogBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    user: Optional[UserResponse] = None

# Complex response schemas
class ProjectDetailResponse(ProjectResponse):
    project_materials: List[ProjectMaterialResponse] = []
    project_equipment: List[ProjectEquipmentResponse] = []
    project_labor: List[ProjectLaborResponse] = []
    project_tasks: List[ProjectTaskResponse] = []
    project_external_costs: List[ProjectExternalCostResponse] = []

class ProjectSummaryResponse(BaseSchema):
    id: str
    name: str
    status: ProjectStatus
    priority: ProjectPriority
    budget: float
    actual_cost: float
    progress: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    manager_name: Optional[str] = None
    total_materials: float = 0.0
    total_equipment: float = 0.0
    total_labor: float = 0.0
    total_external: float = 0.0
    grand_total: float = 0.0

# Dashboard schemas
class DashboardStats(BaseSchema):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_budget: float
    total_spent: float
    total_materials: int
    total_equipment: int
    total_labor_roles: int
    unread_notifications: int

class RecentProject(BaseSchema):
    id: str
    name: str
    status: ProjectStatus
    priority: ProjectPriority
    budget: float
    actual_cost: float
    progress: int
    manager_name: str
    days_remaining: Optional[int] = None
    is_overdue: bool = False

# Search and filter schemas
class SearchFilters(BaseSchema):
    search_term: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    manager_id: Optional[str] = None
    category: Optional[str] = None
    start_date_from: Optional[datetime] = None
    start_date_to: Optional[datetime] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None

class PaginationParams(BaseSchema):
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: Optional[str] = Field("asc", regex="^(asc|desc)$")

# API Response schemas
class APIResponse(BaseSchema):
    success: bool
    message: str
    data: Optional[Any] = None

class PaginatedResponse(BaseSchema):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

# Quote schemas
class QuoteItemBase(BaseSchema):
    item_type: QuoteItemType
    item_name: str = Field(..., max_length=200)
    description: Optional[str] = None
    quantity: int = Field(1, gt=0)
    unit_price: float = Field(..., gt=0)
    total_price: float = Field(..., gt=0)
    sort_order: int = Field(0, ge=0)

class QuoteItemCreate(QuoteItemBase):
    pass

class QuoteItemUpdate(BaseSchema):
    item_type: Optional[QuoteItemType] = None
    item_name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    quantity: Optional[int] = Field(None, gt=0)
    unit_price: Optional[float] = Field(None, gt=0)
    total_price: Optional[float] = Field(None, gt=0)
    sort_order: Optional[int] = Field(None, ge=0)

class QuoteItemResponse(QuoteItemBase):
    id: str
    quote_id: str
    created_at: datetime

class QuoteBase(BaseSchema):
    quote_number: str = Field(..., max_length=50)
    client_name: str = Field(..., max_length=200)
    client_email: Optional[str] = Field(None, max_length=100)
    client_phone: Optional[str] = Field(None, max_length=20)
    client_address: Optional[str] = None
    project_name: str = Field(..., max_length=200)
    project_description: Optional[str] = None
    sor_code: Optional[str] = Field(None, max_length=100)
    sor_description: Optional[str] = None
    region: Optional[str] = Field(None, max_length=50)
    status: QuoteStatus = QuoteStatus.DRAFT
    subtotal: float = Field(0.0, ge=0)
    tax_rate: float = Field(0.0, ge=0, le=100)
    tax_amount: float = Field(0.0, ge=0)
    total_amount: float = Field(0.0, ge=0)
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None

class QuoteCreate(QuoteBase):
    quote_items: List[QuoteItemCreate] = []

class QuoteUpdate(BaseSchema):
    quote_number: Optional[str] = Field(None, max_length=50)
    client_name: Optional[str] = Field(None, max_length=200)
    client_email: Optional[str] = Field(None, max_length=100)
    client_phone: Optional[str] = Field(None, max_length=20)
    client_address: Optional[str] = None
    project_name: Optional[str] = Field(None, max_length=200)
    project_description: Optional[str] = None
    sor_code: Optional[str] = Field(None, max_length=100)
    sor_description: Optional[str] = None
    region: Optional[str] = Field(None, max_length=50)
    status: Optional[QuoteStatus] = None
    subtotal: Optional[float] = Field(None, ge=0)
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    tax_amount: Optional[float] = Field(None, ge=0)
    total_amount: Optional[float] = Field(None, ge=0)
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None

class QuoteResponse(QuoteBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by_user: Optional[UserResponse] = None
    quote_items: List[QuoteItemResponse] = []

class QuoteSummaryResponse(BaseSchema):
    id: str
    quote_number: str
    client_name: str
    project_name: str
    status: QuoteStatus
    total_amount: float
    created_at: datetime
    valid_until: Optional[datetime] = None
    created_by_user: Optional[UserResponse] = None

# Calculator schemas
class CalculatorRequest(BaseSchema):
    client_name: str = Field(..., max_length=200)
    region: str = Field(..., max_length=50)
    product_sor: str = Field(..., max_length=200)
    sor_code: Optional[str] = Field(None, max_length=100)
    sor_description: Optional[str] = None
    risk_uplift: float = Field(0.0, ge=0, le=100)
    additional_support: List[str] = []

class CalculatorResponse(BaseSchema):
    base_amount: float
    support_amount: float
    subtotal: float
    total_amount: float
    breakdown: Dict[str, Any] = {}

# Bulk Operations schemas
class BulkImportRequest(BaseSchema):
    file_type: str = Field(..., regex="^(csv|json)$")
    data: List[Dict[str, Any]] = Field(..., min_items=1)

class BulkImportResponse(BaseSchema):
    success: bool
    message: str
    imported_count: int
    failed_count: int
    errors: List[str] = []

class BulkExportRequest(BaseSchema):
    entity_type: str = Field(..., regex="^(projects|materials|equipment|labour_roles|quotes)$")
    filters: Optional[SearchFilters] = None
    format: str = Field("json", regex="^(json|csv)$")

class BulkExportResponse(BaseSchema):
    success: bool
    message: str
    download_url: str
    file_size: int

# Admin Dashboard schemas
class AdminDashboardStats(BaseSchema):
    total_projects: int
    active_projects: int
    completed_projects: int
    pending_projects: int
    cancelled_projects: int
    total_budget: float
    total_spent: float
    budget_utilization: float
    total_materials: int
    total_equipment: int
    total_labor_roles: int
    total_quotes: int
    unread_notifications: int
    recent_activity: List[Dict[str, Any]] = []

class AdminProjectSummary(BaseSchema):
    id: str
    name: str
    sor_code: Optional[str] = None
    sor_description: Optional[str] = None
    sor_type: Optional[str] = None
    status: ProjectStatus
    priority: ProjectPriority
    budget: float
    actual_cost: float
    progress: int
    region: Optional[str] = None
    manager_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class AdminSearchRequest(BaseSchema):
    search_term: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    region: Optional[str] = None
    sor_type: Optional[str] = None
    manager_id: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None

# Enhanced Search and Filter schemas
class AdvancedSearchFilters(BaseSchema):
    search_term: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    manager_id: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    sor_type: Optional[str] = None
    sor_code: Optional[str] = None
    start_date_from: Optional[datetime] = None
    start_date_to: Optional[datetime] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    progress_min: Optional[int] = Field(None, ge=0, le=100)
    progress_max: Optional[int] = Field(None, ge=0, le=100)

# Activity Feed schemas
class ActivityItem(BaseSchema):
    id: str
    type: NotificationType
    severity: NotificationSeverity
    title: str
    message: str
    sender: Optional[str] = None
    time: str
    is_read: bool
    related_project_id: Optional[str] = None
    related_entity_id: Optional[str] = None

class ActivityFeedResponse(BaseSchema):
    activities: List[ActivityItem] = []
    unread_count: int
    total_count: int