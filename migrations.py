#!/usr/bin/env python3
"""
Database Migration Script for SOR Fields
This script adds the new SOR fields to existing tables
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    """Add SOR fields to existing database tables"""
    
    # Database file path
    db_path = "slc_project_management.db"
    
    if not os.path.exists(db_path):
        print("Database file not found. Please run the application first to create the database.")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Starting database migration...")
        
        # Check if SOR fields already exist
        cursor.execute("PRAGMA table_info(projects)")
        project_columns = [column[1] for column in cursor.fetchall()]
        
        # Add SOR fields to projects table if they don't exist
        if 'sor_code' not in project_columns:
            print("➕ Adding SOR fields to projects table...")
            cursor.execute("ALTER TABLE projects ADD COLUMN sor_code VARCHAR(100)")
            cursor.execute("ALTER TABLE projects ADD COLUMN sor_description TEXT")
            cursor.execute("ALTER TABLE projects ADD COLUMN sor_type VARCHAR(100)")
            cursor.execute("ALTER TABLE projects ADD COLUMN region VARCHAR(50)")
            print("✅ SOR fields added to projects table")
        else:
            print("ℹ️  SOR fields already exist in projects table")
        
        # Check quotes table
        cursor.execute("PRAGMA table_info(quotes)")
        quote_columns = [column[1] for column in cursor.fetchall()]
        
        # Add SOR fields to quotes table if they don't exist
        if 'sor_code' not in quote_columns:
            print("➕ Adding SOR fields to quotes table...")
            cursor.execute("ALTER TABLE quotes ADD COLUMN sor_code VARCHAR(100)")
            cursor.execute("ALTER TABLE quotes ADD COLUMN sor_description TEXT")
            print("✅ SOR fields added to quotes table")
        else:
            print("ℹ️  SOR fields already exist in quotes table")
        
        # Commit changes
        conn.commit()
        print("✅ Database migration completed successfully!")
        
        # Show updated table structure
        print("\n📋 Updated table structures:")
        
        print("\nProjects table:")
        cursor.execute("PRAGMA table_info(projects)")
        for column in cursor.fetchall():
            print(f"  - {column[1]} ({column[2]})")
        
        print("\nQuotes table:")
        cursor.execute("PRAGMA table_info(quotes)")
        for column in cursor.fetchall():
            print(f"  - {column[1]} ({column[2]})")
        
    except sqlite3.Error as e:
        print(f"❌ Database migration failed: {e}")
        conn.rollback()
    except Exception as e:
        print(f"❌ Unexpected error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

def create_sample_data():
    """Create sample data with SOR fields"""
    
    db_path = "slc_project_management.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n🌱 Creating sample data with SOR fields...")
        
        # Sample projects with SOR data
        sample_projects = [
            {
                'id': 'proj-001',
                'name': 'Office Renovation Project',
                'description': 'Complete office renovation including electrical, plumbing, and structural upgrades',
                'sor_code': 'SOR-2024-001',
                'sor_description': 'Office renovation with electrical and plumbing upgrades',
                'sor_type': 'Renovation',
                'region': 'NSW',
                'manager_id': 'user-001',
                'category': 'Construction',
                'status': 'in_progress',
                'priority': 'high',
                'budget': 150000.0,
                'actual_cost': 120000.0,
                'progress': 80,
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'proj-002',
                'name': 'Warehouse Electrical Upgrade',
                'description': 'Electrical system upgrade for warehouse facility',
                'sor_code': 'SOR-2024-002',
                'sor_description': 'Electrical system upgrade and safety improvements',
                'sor_type': 'Electrical',
                'region': 'VIC',
                'manager_id': 'user-002',
                'category': 'Electrical',
                'status': 'planning',
                'priority': 'medium',
                'budget': 75000.0,
                'actual_cost': 0.0,
                'progress': 0,
                'created_at': datetime.now().isoformat()
            }
        ]
        
        # Insert sample projects
        for project in sample_projects:
            cursor.execute("""
                INSERT OR REPLACE INTO projects 
                (id, name, description, sor_code, sor_description, sor_type, region, 
                 manager_id, category, status, priority, budget, actual_cost, progress, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                project['id'], project['name'], project['description'],
                project['sor_code'], project['sor_description'], project['sor_type'],
                project['region'], project['manager_id'], project['category'],
                project['status'], project['priority'], project['budget'],
                project['actual_cost'], project['progress'], project['created_at']
            ))
        
        # Sample quotes with SOR data
        sample_quotes = [
            {
                'id': 'quote-001',
                'quote_number': 'Q-2024-001',
                'client_name': 'ABC Corporation',
                'project_name': 'Office Renovation Project',
                'project_description': 'Complete office renovation including electrical, plumbing, and structural upgrades',
                'sor_code': 'SOR-2024-001',
                'sor_description': 'Office renovation with electrical and plumbing upgrades',
                'region': 'NSW',
                'status': 'draft',
                'subtotal': 150000.0,
                'total_amount': 165000.0,
                'created_by': 'user-001',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        # Insert sample quotes
        for quote in sample_quotes:
            cursor.execute("""
                INSERT OR REPLACE INTO quotes 
                (id, quote_number, client_name, project_name, project_description, 
                 sor_code, sor_description, region, status, subtotal, total_amount, 
                 created_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                quote['id'], quote['quote_number'], quote['client_name'],
                quote['project_name'], quote['project_description'],
                quote['sor_code'], quote['sor_description'], quote['region'],
                quote['status'], quote['subtotal'], quote['total_amount'],
                quote['created_by'], quote['created_at']
            ))
        
        conn.commit()
        print("✅ Sample data created successfully!")
        
    except sqlite3.Error as e:
        print(f"❌ Failed to create sample data: {e}")
        conn.rollback()
    except Exception as e:
        print(f"❌ Unexpected error creating sample data: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 SLC Project Management Database Migration")
    print("=" * 50)
    
    # Run migration
    migrate_database()
    
    # Ask if user wants to create sample data
    create_sample = input("\n🤔 Would you like to create sample data with SOR fields? (y/n): ").lower().strip()
    if create_sample in ['y', 'yes']:
        create_sample_data()
    
    print("\n🎉 Migration process completed!")
    print("\n📝 Next steps:")
    print("1. Start the FastAPI server: python start_server.py")
    print("2. Visit the API documentation: http://localhost:8000/docs")
    print("3. Test the new SOR endpoints")
