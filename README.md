# SLC Project Management API

A comprehensive FastAPI backend for the SLC Project Management System, providing full CRUD operations for quotes, materials, equipment, labor roles, projects, and notifications.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip or pipenv

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env file (optional)
   echo "DATABASE_URL=sqlite:///./slc_project_management.db" > .env
   echo "HOST=0.0.0.0" >> .env
   echo "PORT=8000" >> .env
   echo "RELOAD=true" >> .env
   ```

3. **Seed the database with sample data:**
   ```bash
   python seed_data.py
   ```

4. **Start the server:**
   ```bash
   python start_server.py
   ```

   Or use uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ API Endpoints

### Core Endpoints

#### Quotes
- `GET /quotes` - List all quotes
- `GET /quotes/{quote_id}` - Get specific quote
- `POST /quotes` - Create new quote
- `PUT /quotes/{quote_id}` - Update quote
- `DELETE /quotes/{quote_id}` - Delete quote
- `GET /quotes/{quote_id}/items` - Get quote items
- `POST /quotes/{quote_id}/items` - Add item to quote
- `PUT /quotes/{quote_id}/items/{item_id}` - Update quote item
- `DELETE /quotes/{quote_id}/items/{item_id}` - Delete quote item

#### Materials
- `GET /materials` - List all materials
- `GET /materials/{material_id}` - Get specific material
- `POST /materials` - Create new material
- `PUT /materials/{material_id}` - Update material
- `DELETE /materials/{material_id}` - Delete material

#### Equipment
- `GET /equipment` - List all equipment
- `GET /equipment/{equipment_id}` - Get specific equipment
- `POST /equipment` - Create new equipment
- `PUT /equipment/{equipment_id}` - Update equipment
- `DELETE /equipment/{equipment_id}` - Delete equipment

#### Labour Roles
- `GET /labour-roles` - List all labour roles
- `GET /labour-roles/{role_id}` - Get specific labour role
- `POST /labour-roles` - Create new labour role
- `PUT /labour-roles/{role_id}` - Update labour role
- `DELETE /labour-roles/{role_id}` - Delete labour role
- `GET /labour-roles/rate/{labour_type}/{state_code}` - Get effective rate

#### Projects
- `GET /projects` - List all projects
- `GET /projects/{project_id}` - Get specific project
- `POST /projects` - Create new project
- `PUT /projects/{project_id}` - Update project
- `DELETE /projects/{project_id}` - Delete project
- `GET /projects/{project_id}/totals` - Get project cost totals
- `GET /projects/recent` - Get recent projects

#### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread` - Get unread notifications
- `POST /notifications` - Create notification
- `PUT /notifications/{notification_id}/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read

#### Calculator
- `POST /calculator/rate-card` - Calculate rate card

#### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

#### System
- `GET /health` - Health check
- `GET /config` - Get system configurations
- `GET /audit-logs` - Get audit logs

## 🗄️ Database Models

### Core Models
- **User** - System users (admin/user roles)
- **Quote** - Customer quotes with items
- **QuoteItem** - Individual items within quotes
- **Material** - Inventory materials
- **Equipment** - Available equipment
- **LabourRole** - Labor types with state-specific rates
- **Project** - Project management
- **Notification** - System notifications
- **SystemConfig** - System configuration
- **AuditLog** - Audit trail

### Enums
- **UserRole**: admin, user
- **QuoteStatus**: draft, sent, accepted, rejected, expired
- **QuoteItemType**: material, equipment, labor, task, external
- **ProjectStatus**: planning, in_progress, completed, on_hold, cancelled
- **ProjectPriority**: low, medium, high, urgent
- **NotificationType**: task, project, system, budget, deadline, price_change, labor_overrun, budget_overrun, overdue, material_shortage, equipment_maintenance, quality_issue, safety_alert, weather_alert, custom
- **NotificationSeverity**: low, medium, high, critical
- **StateCode**: NSW, VIC, QLD, NT, SA, WA, TAS, ACT
- **TaskStatus**: pending, in_progress, completed, cancelled

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - Database connection string (default: SQLite)
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
- `RELOAD` - Auto-reload on changes (default: true)

### CORS Configuration
The API is configured to accept requests from:
- http://localhost:3000 (React default)
- http://localhost:5173 (Vite default)
- http://localhost:5174 (Vite alternative)

## 📊 Sample Data

The seed script creates:
- **3 Users**: admin, manager1, user1
- **11 Materials**: Generators, UPS systems, cables, panels, circuit breakers
- **8 Equipment**: Cranes, excavators, generators, tools
- **32 Labour Roles**: State-specific rates for NSW, VIC, QLD, NT
- **3 Sample Quotes**: With detailed quote items
- **8 Sample Notifications**: Various types and severities
- **5 System Configurations**: Default settings

## 🔐 Authentication

Currently uses a simplified authentication system for demo purposes. In production, implement proper JWT token authentication.

## 🧪 Testing

Test the API endpoints using:
1. **Swagger UI**: http://localhost:8000/docs
2. **curl commands**:
   ```bash
   # Health check
   curl http://localhost:8000/health
   
   # Get quotes
   curl http://localhost:8000/quotes
   
   # Get materials
   curl http://localhost:8000/materials
   ```

## 🚀 Production Deployment

For production deployment:

1. **Use a production database** (PostgreSQL, MySQL)
2. **Implement proper authentication** (JWT tokens)
3. **Add rate limiting** and security middleware
4. **Use environment variables** for sensitive data
5. **Set up logging** and monitoring
6. **Use a production ASGI server** (Gunicorn with Uvicorn workers)

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

Error responses:
```json
{
  "detail": "Error message"
}
```

## 🔄 Integration with Frontend

The API is designed to work seamlessly with the React frontend. Key integration points:

1. **Quotes Management**: Full CRUD operations for quotes and quote items
2. **Inventory Management**: Materials and equipment management
3. **Labor Management**: State-specific labor rates
4. **Calculator**: Rate card calculations
5. **Notifications**: Real-time notification system
6. **Dashboard**: Statistics and analytics

## 📞 Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review the sample data in `seed_data.py`
3. Test endpoints using the Swagger UI
4. Check server logs for error details

---

**Happy coding! 🎉**