#!/usr/bin/env python3
"""
FastAPI Server Startup Script
This script starts the FastAPI server with proper configuration
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def main():
    """Start the FastAPI server"""
    print("🚀 Starting SLC Project Management API Server...")
    print("📋 Available endpoints:")
    print("   • API Documentation: http://localhost:8000/docs")
    print("   • ReDoc Documentation: http://localhost:8000/redoc")
    print("   • Health Check: http://localhost:8000/health")
    print("   • Quotes API: http://localhost:8000/quotes")
    print("   • Materials API: http://localhost:8000/materials")
    print("   • Equipment API: http://localhost:8000/equipment")
    print("   • Labour Roles API: http://localhost:8000/labour-roles")
    print("   • Notifications API: http://localhost:8000/notifications")
    print("   • Dashboard API: http://localhost:8000/dashboard/stats")
    print("   • Calculator API: http://localhost:8000/calculator/rate-card")
    print()
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print(f"🌐 Server will run on: http://{host}:{port}")
    print(f"🔄 Auto-reload: {'Enabled' if reload else 'Disabled'}")
    print()
    
    try:
        # Start the server
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()