from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import Base, User, Material, Equipment, LabourRole, SystemConfig, UserRole, StateCode, Quote, QuoteItem, Notification, QuoteStatus, QuoteItemType, NotificationType, NotificationSeverity
from passlib.context import CryptContext
import uuid

# Create tables
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_database():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database...")
        
        # Create users
        users_data = [
            {
                "username": "admin",
                "email": "admin@slc.com",
                "password_hash": get_password_hash("admin123"),
                "role": UserRole.ADMIN
            },
            {
                "username": "manager1",
                "email": "manager1@slc.com",
                "password_hash": get_password_hash("manager123"),
                "role": UserRole.USER
            },
            {
                "username": "user1",
                "email": "user1@slc.com",
                "password_hash": get_password_hash("user123"),
                "role": UserRole.USER
            }
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
        
        db.commit()
        print("✓ Users created")
        
        # Create materials
        materials_data = [
            {
                "id": "M01",
                "sales_part_no": "10-DG094",
                "description": "10kVA Perkins Enclosed Generator (Elcos)",
                "site": "3DT01",
                "price": 4545.45,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M02",
                "sales_part_no": "10-DG095",
                "description": "10kVA Perkins Enclosed Generator (Elcos)",
                "site": "3DT01",
                "price": 4545.45,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M03",
                "sales_part_no": "20-DG096",
                "description": "20kVA Perkins Enclosed Generator (Elcos)",
                "site": "3DT01",
                "price": 6500.00,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M04",
                "sales_part_no": "UPS-5KVA",
                "description": "5kVA UPS System with Battery Backup",
                "site": "3DT01",
                "price": 3200.00,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M05",
                "sales_part_no": "UPS-10KVA",
                "description": "10kVA UPS System with Battery Backup",
                "site": "3DT01",
                "price": 4800.00,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M06",
                "sales_part_no": "CABLE-POWER-16MM",
                "description": "16mm² Power Cable (per meter)",
                "site": "3DT01",
                "price": 25.50,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M07",
                "sales_part_no": "CABLE-POWER-25MM",
                "description": "25mm² Power Cable (per meter)",
                "site": "3DT01",
                "price": 35.75,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M08",
                "sales_part_no": "PANEL-MAIN-100A",
                "description": "100A Main Distribution Panel",
                "site": "3DT01",
                "price": 1200.00,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M09",
                "sales_part_no": "PANEL-SUB-63A",
                "description": "63A Sub Distribution Panel",
                "site": "3DT01",
                "price": 850.00,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "M10",
                "sales_part_no": "SWITCH-MCB-32A",
                "description": "32A MCB Circuit Breaker",
                "site": "3DT01",
                "price": 45.00,
                "image_url": None,
                "is_custom": False
            },
            {
                "id": "CUSTOM-001",
                "sales_part_no": "CUSTOM",
                "description": "Custom Task - Electrical Installation",
                "site": "3DT01",
                "price": 0.00,
                "image_url": None,
                "is_custom": True
            },
            {
                "id": "CUSTOM-002",
                "sales_part_no": "CUSTOM",
                "description": "Custom Task - Cable Laying",
                "site": "3DT01",
                "price": 0.00,
                "image_url": None,
                "is_custom": True
            }
        ]
        
        for material_data in materials_data:
            material = Material(**material_data)
            db.add(material)
        
        db.commit()
        print("✓ Materials created")
        
        # Create equipment
        equipment_data = [
            {
                "id": "E01",
                "name": "Crane 50T",
                "category": "Heavy Equipment",
                "site": "3DT01",
                "price": 5000.00,
                "image_url": None
            },
            {
                "id": "E02",
                "name": "Excavator",
                "category": "Heavy Equipment",
                "site": "3DT01",
                "price": 3000.00,
                "image_url": None
            },
            {
                "id": "E03",
                "name": "Generator Set",
                "category": "Power Equipment",
                "site": "3DT01",
                "price": 2000.00,
                "image_url": None
            },
            {
                "id": "E04",
                "name": "Welding Machine",
                "category": "Tools",
                "site": "3DT01",
                "price": 800.00,
                "image_url": None
            },
            {
                "id": "E05",
                "name": "Compressor",
                "category": "Tools",
                "site": "3DT01",
                "price": 1200.00,
                "image_url": None
            },
            {
                "id": "E06",
                "name": "Drill Rig",
                "category": "Heavy Equipment",
                "site": "3DT01",
                "price": 4000.00,
                "image_url": None
            },
            {
                "id": "E07",
                "name": "Concrete Mixer",
                "category": "Construction Equipment",
                "site": "3DT01",
                "price": 1500.00,
                "image_url": None
            },
            {
                "id": "E08",
                "name": "Forklift",
                "category": "Material Handling",
                "site": "3DT01",
                "price": 2500.00,
                "image_url": None
            }
        ]
        
        for equipment_data in equipment_data:
            equipment = Equipment(**equipment_data)
            db.add(equipment)
        
        db.commit()
        print("✓ Equipment created")
        
        # Create labour roles
        labour_roles_data = [
            # NSW Labour Rates
            {
                "id": "LR001",
                "labour_type": "Labour Normal",
                "hours": 8,
                "cost_per_person": 75.00,
                "state_code": StateCode.NSW,
                "state_adjustment": 1.0
            },
            {
                "id": "LR002",
                "labour_type": "OT",
                "hours": 2,
                "cost_per_person": 110.00,
                "state_code": StateCode.NSW,
                "state_adjustment": 1.0
            },
            {
                "id": "LR003",
                "labour_type": "Site visit",
                "hours": 3,
                "cost_per_person": 65.00,
                "state_code": StateCode.NSW,
                "state_adjustment": 1.0
            },
            {
                "id": "LR004",
                "labour_type": "Mobilisation",
                "hours": 2,
                "cost_per_person": 80.00,
                "state_code": StateCode.NSW,
                "state_adjustment": 1.0
            },
            {
                "id": "LR005",
                "labour_type": "Stand down",
                "hours": 4,
                "cost_per_person": 50.00,
                "state_code": StateCode.NSW,
                "state_adjustment": 1.0
            },
            {
                "id": "LR006",
                "labour_type": "Inductions",
                "hours": 1,
                "cost_per_person": 45.00,
                "state_code": StateCode.NSW,
                "state_adjustment": 1.0
            },
            {
                "id": "LR007",
                "labour_type": "Test/Commission",
                "hours": 6,
                "cost_per_person": 95.00,
                "state_code": StateCode.NSW,
                "state_adjustment": 1.0
            },
            {
                "id": "LR008",
                "labour_type": "Documentation",
                "hours": 5,
                "cost_per_person": 70.00,
                "state_code": StateCode.NSW,
                "state_adjustment": 1.0
            },
            # VIC Labour Rates
            {
                "id": "LR009",
                "labour_type": "Labour Normal",
                "hours": 8,
                "cost_per_person": 75.00,
                "state_code": StateCode.VIC,
                "state_adjustment": 1.0
            },
            {
                "id": "LR010",
                "labour_type": "OT",
                "hours": 2,
                "cost_per_person": 110.00,
                "state_code": StateCode.VIC,
                "state_adjustment": 1.0
            },
            {
                "id": "LR011",
                "labour_type": "Site visit",
                "hours": 3,
                "cost_per_person": 65.00,
                "state_code": StateCode.VIC,
                "state_adjustment": 1.0
            },
            {
                "id": "LR012",
                "labour_type": "Mobilisation",
                "hours": 2,
                "cost_per_person": 80.00,
                "state_code": StateCode.VIC,
                "state_adjustment": 1.0
            },
            {
                "id": "LR013",
                "labour_type": "Stand down",
                "hours": 4,
                "cost_per_person": 50.00,
                "state_code": StateCode.VIC,
                "state_adjustment": 1.0
            },
            {
                "id": "LR014",
                "labour_type": "Inductions",
                "hours": 1,
                "cost_per_person": 45.00,
                "state_code": StateCode.VIC,
                "state_adjustment": 1.0
            },
            {
                "id": "LR015",
                "labour_type": "Test/Commission",
                "hours": 6,
                "cost_per_person": 95.00,
                "state_code": StateCode.VIC,
                "state_adjustment": 1.0
            },
            {
                "id": "LR016",
                "labour_type": "Documentation",
                "hours": 5,
                "cost_per_person": 70.00,
                "state_code": StateCode.VIC,
                "state_adjustment": 1.0
            },
            # QLD Labour Rates
            {
                "id": "LR017",
                "labour_type": "Labour Normal",
                "hours": 8,
                "cost_per_person": 75.00,
                "state_code": StateCode.QLD,
                "state_adjustment": 1.0
            },
            {
                "id": "LR018",
                "labour_type": "OT",
                "hours": 2,
                "cost_per_person": 110.00,
                "state_code": StateCode.QLD,
                "state_adjustment": 1.0
            },
            {
                "id": "LR019",
                "labour_type": "Site visit",
                "hours": 3,
                "cost_per_person": 65.00,
                "state_code": StateCode.QLD,
                "state_adjustment": 1.0
            },
            {
                "id": "LR020",
                "labour_type": "Mobilisation",
                "hours": 2,
                "cost_per_person": 80.00,
                "state_code": StateCode.QLD,
                "state_adjustment": 1.0
            },
            {
                "id": "LR021",
                "labour_type": "Stand down",
                "hours": 4,
                "cost_per_person": 50.00,
                "state_code": StateCode.QLD,
                "state_adjustment": 1.0
            },
            {
                "id": "LR022",
                "labour_type": "Inductions",
                "hours": 1,
                "cost_per_person": 45.00,
                "state_code": StateCode.QLD,
                "state_adjustment": 1.0
            },
            {
                "id": "LR023",
                "labour_type": "Test/Commission",
                "hours": 6,
                "cost_per_person": 95.00,
                "state_code": StateCode.QLD,
                "state_adjustment": 1.0
            },
            {
                "id": "LR024",
                "labour_type": "Documentation",
                "hours": 5,
                "cost_per_person": 70.00,
                "state_code": StateCode.QLD,
                "state_adjustment": 1.0
            },
            # NT Labour Rates (OT is 10% cheaper)
            {
                "id": "LR025",
                "labour_type": "Labour Normal",
                "hours": 8,
                "cost_per_person": 75.00,
                "state_code": StateCode.NT,
                "state_adjustment": 1.0
            },
            {
                "id": "LR026",
                "labour_type": "OT",
                "hours": 2,
                "cost_per_person": 100.00,  # 10% cheaper than other states
                "state_code": StateCode.NT,
                "state_adjustment": 1.0
            },
            {
                "id": "LR027",
                "labour_type": "Site visit",
                "hours": 3,
                "cost_per_person": 65.00,
                "state_code": StateCode.NT,
                "state_adjustment": 1.0
            },
            {
                "id": "LR028",
                "labour_type": "Mobilisation",
                "hours": 2,
                "cost_per_person": 80.00,
                "state_code": StateCode.NT,
                "state_adjustment": 1.0
            },
            {
                "id": "LR029",
                "labour_type": "Stand down",
                "hours": 4,
                "cost_per_person": 50.00,
                "state_code": StateCode.NT,
                "state_adjustment": 1.0
            },
            {
                "id": "LR030",
                "labour_type": "Inductions",
                "hours": 1,
                "cost_per_person": 45.00,
                "state_code": StateCode.NT,
                "state_adjustment": 1.0
            },
            {
                "id": "LR031",
                "labour_type": "Test/Commission",
                "hours": 6,
                "cost_per_person": 95.00,
                "state_code": StateCode.NT,
                "state_adjustment": 1.0
            },
            {
                "id": "LR032",
                "labour_type": "Documentation",
                "hours": 5,
                "cost_per_person": 70.00,
                "state_code": StateCode.NT,
                "state_adjustment": 1.0
            }
        ]
        
        for labour_role_data in labour_roles_data:
            labour_role = LabourRole(**labour_role_data)
            db.add(labour_role)
        
        db.commit()
        print("✓ Labour roles created")
        
        # Create system configurations
        system_configs_data = [
            {
                "key": "default_risk_rate",
                "value": "10",
                "description": "Default risk rate percentage for projects"
            },
            {
                "key": "crane_fee_enabled",
                "value": "true",
                "description": "Whether crane fee option is enabled by default"
            },
            {
                "key": "max_project_budget",
                "value": "1000000",
                "description": "Maximum allowed project budget"
            },
            {
                "key": "notification_retention_days",
                "value": "30",
                "description": "Number of days to retain notifications"
            },
            {
                "key": "audit_log_retention_days",
                "value": "365",
                "description": "Number of days to retain audit logs"
            }
        ]
        
        for config_data in system_configs_data:
            config = SystemConfig(**config_data)
            db.add(config)
        
        db.commit()
        print("✓ System configurations created")
        
        # Get admin user for creating quotes and notifications
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        # Create sample quotes
        quotes_data = [
            {
                "id": "Q001",
                "quote_number": "Q2024010001",
                "client_name": "ABC Construction Ltd",
                "client_email": "contact@abcconstruction.com",
                "client_phone": "+61 2 1234 5678",
                "client_address": "123 Construction St, Sydney NSW 2000",
                "project_name": "Office Building Electrical Installation",
                "project_description": "Complete electrical installation for new office building including power distribution, lighting, and emergency systems.",
                "region": "NSW",
                "status": QuoteStatus.SENT,
                "subtotal": 45000.00,
                "tax_rate": 10.0,
                "tax_amount": 4500.00,
                "total_amount": 49500.00,
                "valid_until": None,
                "notes": "Quote valid for 30 days from issue date.",
                "created_by": admin_user.id
            },
            {
                "id": "Q002",
                "quote_number": "Q2024010002",
                "client_name": "XYZ Industrial Pty Ltd",
                "client_email": "projects@xyzindustrial.com",
                "client_phone": "+61 3 9876 5432",
                "client_address": "456 Industrial Ave, Melbourne VIC 3000",
                "project_name": "Factory Power Upgrade",
                "project_description": "Upgrade existing factory power distribution system to handle increased load requirements.",
                "region": "VIC",
                "status": QuoteStatus.DRAFT,
                "subtotal": 28000.00,
                "tax_rate": 10.0,
                "tax_amount": 2800.00,
                "total_amount": 30800.00,
                "valid_until": None,
                "notes": "Pending client approval for additional scope items.",
                "created_by": admin_user.id
            },
            {
                "id": "Q003",
                "quote_number": "Q2024010003",
                "client_name": "Mining Corp Australia",
                "client_email": "engineering@miningcorp.com.au",
                "client_phone": "+61 8 5555 1234",
                "client_address": "789 Mining Rd, Perth WA 6000",
                "project_name": "Mining Site Power Infrastructure",
                "project_description": "Installation of power infrastructure for remote mining site including generators, distribution panels, and safety systems.",
                "region": "WA",
                "status": QuoteStatus.ACCEPTED,
                "subtotal": 125000.00,
                "tax_rate": 10.0,
                "tax_amount": 12500.00,
                "total_amount": 137500.00,
                "valid_until": None,
                "notes": "Project approved and ready to commence.",
                "created_by": admin_user.id
            }
        ]
        
        for quote_data in quotes_data:
            quote = Quote(**quote_data)
            db.add(quote)
        
        db.commit()
        print("✓ Sample quotes created")
        
        # Create sample quote items
        quote_items_data = [
            # Quote Q001 items
            {
                "id": "QI001",
                "quote_id": "Q001",
                "item_type": QuoteItemType.MATERIAL,
                "item_name": "10kVA Perkins Generator",
                "description": "10kVA Perkins Enclosed Generator (Elcos)",
                "quantity": 2,
                "unit_price": 4545.45,
                "total_price": 9090.90,
                "sort_order": 1
            },
            {
                "id": "QI002",
                "quote_id": "Q001",
                "item_type": QuoteItemType.MATERIAL,
                "item_name": "100A Main Distribution Panel",
                "description": "100A Main Distribution Panel with circuit breakers",
                "quantity": 1,
                "unit_price": 1200.00,
                "total_price": 1200.00,
                "sort_order": 2
            },
            {
                "id": "QI003",
                "quote_id": "Q001",
                "item_type": QuoteItemType.LABOR,
                "item_name": "Electrical Installation Labor",
                "description": "Professional electrical installation services",
                "quantity": 40,
                "unit_price": 75.00,
                "total_price": 3000.00,
                "sort_order": 3
            },
            {
                "id": "QI004",
                "quote_id": "Q001",
                "item_type": QuoteItemType.EQUIPMENT,
                "item_name": "Crane Rental",
                "description": "50T Crane for equipment installation",
                "quantity": 1,
                "unit_price": 5000.00,
                "total_price": 5000.00,
                "sort_order": 4
            },
            # Quote Q002 items
            {
                "id": "QI005",
                "quote_id": "Q002",
                "item_type": QuoteItemType.MATERIAL,
                "item_name": "25mm² Power Cable",
                "description": "25mm² Power Cable (per meter)",
                "quantity": 500,
                "unit_price": 35.75,
                "total_price": 17875.00,
                "sort_order": 1
            },
            {
                "id": "QI006",
                "quote_id": "Q002",
                "item_type": QuoteItemType.LABOR,
                "item_type": QuoteItemType.LABOR,
                "item_name": "Cable Installation Labor",
                "description": "Professional cable installation and termination",
                "quantity": 20,
                "unit_price": 75.00,
                "total_price": 1500.00,
                "sort_order": 2
            },
            # Quote Q003 items
            {
                "id": "QI007",
                "quote_id": "Q003",
                "item_type": QuoteItemType.MATERIAL,
                "item_name": "20kVA Perkins Generator",
                "description": "20kVA Perkins Enclosed Generator (Elcos)",
                "quantity": 4,
                "unit_price": 6500.00,
                "total_price": 26000.00,
                "sort_order": 1
            },
            {
                "id": "QI008",
                "quote_id": "Q003",
                "item_type": QuoteItemType.EQUIPMENT,
                "item_name": "Drill Rig Rental",
                "description": "Heavy duty drill rig for foundation work",
                "quantity": 1,
                "unit_price": 4000.00,
                "total_price": 4000.00,
                "sort_order": 2
            },
            {
                "id": "QI009",
                "quote_id": "Q003",
                "item_type": QuoteItemType.LABOR,
                "item_name": "Mining Site Installation",
                "description": "Specialized mining site electrical installation",
                "quantity": 120,
                "unit_price": 95.00,
                "total_price": 11400.00,
                "sort_order": 3
            }
        ]
        
        for item_data in quote_items_data:
            quote_item = QuoteItem(**item_data)
            db.add(quote_item)
        
        db.commit()
        print("✓ Sample quote items created")
        
        # Create sample notifications
        notifications_data = [
            {
                "id": "N001",
                "user_id": admin_user.id,
                "type": NotificationType.BUDGET_OVERRUN,
                "severity": NotificationSeverity.HIGH,
                "title": "Budget Overrun Alert",
                "message": "Project 'Office Building Electrical Installation' has exceeded budget by 15%",
                "related_project_id": None,
                "related_entity_id": "Q001",
                "is_read": False
            },
            {
                "id": "N002",
                "user_id": admin_user.id,
                "type": NotificationType.DEADLINE,
                "severity": NotificationSeverity.MEDIUM,
                "title": "Upcoming Deadline",
                "message": "Quote Q2024010002 expires in 3 days",
                "related_project_id": None,
                "related_entity_id": "Q002",
                "is_read": False
            },
            {
                "id": "N003",
                "user_id": admin_user.id,
                "type": NotificationType.PRICE_CHANGE,
                "severity": NotificationSeverity.LOW,
                "title": "Price Update",
                "message": "Material price updated for 10kVA Perkins Generator",
                "related_project_id": None,
                "related_entity_id": "M01",
                "is_read": True
            },
            {
                "id": "N004",
                "user_id": admin_user.id,
                "type": NotificationType.OVERDUE,
                "severity": NotificationSeverity.HIGH,
                "title": "Overdue Project",
                "message": "Mining Site Power Infrastructure project is 5 days overdue",
                "related_project_id": None,
                "related_entity_id": "Q003",
                "is_read": False
            },
            {
                "id": "N005",
                "user_id": admin_user.id,
                "type": NotificationType.MATERIAL_SHORTAGE,
                "severity": NotificationSeverity.MEDIUM,
                "title": "Material Shortage",
                "message": "Low stock alert: 25mm² Power Cable (only 50m remaining)",
                "related_project_id": None,
                "related_entity_id": "M07",
                "is_read": False
            },
            {
                "id": "N006",
                "user_id": admin_user.id,
                "type": NotificationType.EQUIPMENT_MAINTENANCE,
                "severity": NotificationSeverity.MEDIUM,
                "title": "Equipment Maintenance Due",
                "message": "Crane 50T requires scheduled maintenance",
                "related_project_id": None,
                "related_entity_id": "E01",
                "is_read": True
            },
            {
                "id": "N007",
                "user_id": admin_user.id,
                "type": NotificationType.QUALITY_ISSUE,
                "severity": NotificationSeverity.HIGH,
                "title": "Quality Issue Reported",
                "message": "Quality issue reported on Factory Power Upgrade project",
                "related_project_id": None,
                "related_entity_id": "Q002",
                "is_read": False
            },
            {
                "id": "N008",
                "user_id": admin_user.id,
                "type": NotificationType.SAFETY_ALERT,
                "severity": NotificationSeverity.CRITICAL,
                "title": "Safety Alert",
                "message": "Safety incident reported at Mining Site Power Infrastructure",
                "related_project_id": None,
                "related_entity_id": "Q003",
                "is_read": False
            }
        ]
        
        for notification_data in notifications_data:
            notification = Notification(**notification_data)
            db.add(notification)
        
        db.commit()
        print("✓ Sample notifications created")
        
        print("✅ Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()