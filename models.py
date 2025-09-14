from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
import uuid

Base = declarative_base()

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

# User Management
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="manager_user")
    notifications = relationship("Notification", back_populates="user")

# Project Management
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    description = Column(Text)
    sor_code = Column(String(100))  # SOR Code field
    sor_description = Column(Text)  # SOR Description field
    sor_type = Column(String(100))  # SOR Type field
    manager_id = Column(String, ForeignKey("users.id"), nullable=False)
    category = Column(String(100))
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.PLANNING)
    priority = Column(SQLEnum(ProjectPriority), default=ProjectPriority.MEDIUM)
    budget = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    progress = Column(Integer, default=0)  # Percentage 0-100
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    region = Column(String(50))  # Region field for projects
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    manager_user = relationship("User", back_populates="projects")
    project_materials = relationship("ProjectMaterial", back_populates="project", cascade="all, delete-orphan")
    project_equipment = relationship("ProjectEquipment", back_populates="project", cascade="all, delete-orphan")
    project_labor = relationship("ProjectLabor", back_populates="project", cascade="all, delete-orphan")
    project_tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan")
    project_external_costs = relationship("ProjectExternalCost", back_populates="project", cascade="all, delete-orphan")

# Inventory Management
class Material(Base):
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    sales_part_no = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    name = Column(String(100))
    state_code = Column(String(10), nullable=False, index=True)
    qty = Column(Integer, default=1)
    unit_cost = Column(Float, nullable=False)
    image_url = Column(String(500))
    sor_code = Column(String(30), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project_materials = relationship("ProjectMaterial", back_populates="material")

class Equipment(Base):
    __tablename__ = "equipments"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    sales_part_no = Column(String(50))
    equipment_name = Column(Text)
    category = Column(String(100), nullable=False)
    state_code = Column(String(100))
    price = Column(Float, nullable=False)
    price_incl_tax = Column(Float, nullable=False)
    sor_code = Column(String(30), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project_equipment = relationship("ProjectEquipment", back_populates="equipment")

# Labor Management
class LabourRate(Base):
    __tablename__ = "labour_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    labour_type = Column(String(100), nullable=False)
    cost_per_person = Column(Float, nullable=False)
    hours = Column(Float, default=1)
    state_code = Column(String(10), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project_labor = relationship("ProjectLabor", back_populates="labour_rate")

# Project Components
class ProjectMaterial(Base):
    __tablename__ = "project_materials"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    material_id = Column(String, ForeignKey("materials.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="project_materials")
    material = relationship("Material", back_populates="project_materials")

class ProjectEquipment(Base):
    __tablename__ = "project_equipment"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="project_equipment")
    equipment = relationship("Equipment", back_populates="project_equipment")

class ProjectLabor(Base):
    __tablename__ = "project_labor"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    labour_rate_id = Column(Integer, ForeignKey("labour_rates.id"), nullable=False)
    persons = Column(Integer, nullable=False, default=1)
    hours = Column(Integer, nullable=False, default=8)
    state_code = Column(String(10), nullable=False)
    unit_rate = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="project_labor")
    labour_rate = relationship("LabourRate", back_populates="project_labor")

class ProjectTask(Base):
    __tablename__ = "project_tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING)
    due_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="project_tasks")

class ProjectExternalCost(Base):
    __tablename__ = "project_external_costs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    cost_type = Column(String(50), nullable=False)  # 'crane_fee', 'risk_rate', etc.
    description = Column(String(200))
    amount = Column(Float, nullable=False)
    percentage = Column(Float)  # For percentage-based costs like risk rate
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="project_external_costs")

# Notification System
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    severity = Column(SQLEnum(NotificationSeverity), default=NotificationSeverity.MEDIUM)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    related_project_id = Column(String, ForeignKey("projects.id"))
    related_entity_id = Column(String)  # For other related entities
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")

# Quote Management
class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quote_number = Column(String(50), unique=True, nullable=False)
    client_name = Column(String(200), nullable=False)
    client_email = Column(String(100))
    client_phone = Column(String(20))
    client_address = Column(Text)
    project_name = Column(String(200), nullable=False)
    project_description = Column(Text)
    sor_code = Column(String(100))  # SOR Code field
    sor_description = Column(Text)  # SOR Description field
    region = Column(String(50))
    status = Column(SQLEnum(QuoteStatus), default=QuoteStatus.DRAFT)
    subtotal = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    valid_until = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_by_user = relationship("User")
    quote_items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")

class QuoteItem(Base):
    __tablename__ = "quote_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quote_id = Column(String, ForeignKey("quotes.id"), nullable=False)
    item_type = Column(SQLEnum(QuoteItemType), nullable=False)
    item_name = Column(String(200), nullable=False)
    description = Column(Text)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quote = relationship("Quote", back_populates="quote_items")

# Price Change Tracking
class PriceChangeLog(Base):
    __tablename__ = "price_change_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(50), nullable=False)  # 'material', 'equipment', 'labor'
    entity_id = Column(String, nullable=False)
    entity_name = Column(String(200), nullable=False)
    old_price = Column(Float, nullable=False)
    new_price = Column(Float, nullable=False)
    changed_by = Column(String, ForeignKey("users.id"))
    change_reason = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    changed_by_user = relationship("User")

# System Configuration
class SystemConfig(Base):
    __tablename__ = "system_config"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Audit Log
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String, nullable=False)
    old_values = Column(Text)  # JSON string
    new_values = Column(Text)  # JSON string
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")