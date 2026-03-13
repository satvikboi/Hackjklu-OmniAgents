"""
OmniAgent Backend - FastAPI Application
Multi-agent AI automation platform for small business owners
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4, UUID
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, File, UploadFile, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import socketio

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import schemas
from schemas.user_schema import (
    UserCreate, UserLogin, UserResponse, 
    BusinessProfileCreate, BusinessProfileResponse, Token
)
from schemas.request_schema import (
    GoalRequest, JobResponse, AgentEvent, 
    JobStatus, AutomationTrigger, FileUploadResponse
)

# Import MCP clients
from mcp.shopify_client import ShopifyClient
from mcp.whatsapp_client import WhatsAppClient
from mcp.gmail_client import GmailClient
from mcp.instagram_client import InstagramClient
from mcp.sheets_client import GoogleSheetsClient
from mcp.notion_client import NotionClient
from mcp.search_client import BraveSearchClient

# Import agents
from agents.planner_agent import PlannerAgent
from agents.researcher_agent import ResearcherAgent
from agents.analyst_agent import AnalystAgent
from agents.marketing_analyst_agent import MarketingAnalystAgent
from agents.writer_agent import WriterAgent
from agents.critic_agent import CriticAgent

# Import automations
from automations.order_automation import OrderAutomation
from automations.inventory_automation import InventoryAutomation
from automations.reengagement_automation import ReengagementAutomation
from automations.social_automation import SocialAutomation
from automations.review_automation import ReviewAutomation
from automations.analytics_automation import AnalyticsAutomation
from automations.ad_intelligence_automation import AdIntelligenceAutomation
from automations.support_automation import SupportAutomation

# Import scheduler and webhooks
from scheduler import AutomationScheduler
from webhooks.shopify_webhook import ShopifyWebhookHandler

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=os.getenv('CORS_ORIGINS', '*').split(','),
    logger=True,
    engineio_logger=True
)

# Store active connections and jobs
active_connections: Dict[str, WebSocket] = {}
active_jobs: Dict[str, dict] = {}

# Mock database (replace with real DB in production)
users_db = {}
business_profiles_db = {}
jobs_db = {}

# Security
security = HTTPBearer()

# Initialize MCP clients
shopify_client = ShopifyClient()
whatsapp_client = WhatsAppClient()
gmail_client = GmailClient()
instagram_client = InstagramClient()
sheets_client = GoogleSheetsClient()
notion_client = NotionClient()
search_client = BraveSearchClient()

# Initialize agents
planner_agent = PlannerAgent()
researcher_agent = ResearcherAgent()
analyst_agent = AnalystAgent()
marketing_agent = MarketingAnalystAgent()
writer_agent = WriterAgent()
critic_agent = CriticAgent()

# Initialize automations
order_automation = OrderAutomation(
    shopify_client, whatsapp_client, gmail_client,
    sheets_client, writer_agent, critic_agent
)
inventory_automation = InventoryAutomation(
    shopify_client, whatsapp_client, gmail_client,
    sheets_client, analyst_agent
)
reengagement_automation = ReengagementAutomation(
    shopify_client, whatsapp_client, gmail_client,
    sheets_client, writer_agent
)
social_automation = SocialAutomation(
    instagram_client, notion_client, search_client,
    writer_agent, marketing_agent, critic_agent
)
review_automation = ReviewAutomation(
    whatsapp_client, gmail_client, writer_agent, critic_agent
)
analytics_automation = AnalyticsAutomation(
    shopify_client, sheets_client, notion_client,
    whatsapp_client, gmail_client, analyst_agent,
    writer_agent, critic_agent
)
ad_intelligence_automation = AdIntelligenceAutomation(
    notion_client, whatsapp_client, search_client,
    marketing_agent, writer_agent
)
support_automation = SupportAutomation(
    instagram_client, whatsapp_client, shopify_client, writer_agent
)

# Initialize scheduler
scheduler = None

# Initialize webhook handler
shopify_webhook_handler = ShopifyWebhookHandler(
    order_automation, 
    os.getenv("SHOPIFY_WEBHOOK_SECRET", "")
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    global scheduler
    # Startup
    print("🚀 Starting OmniAgent Backend...")
    
    # Initialize and start scheduler
    scheduler = AutomationScheduler(sio)
    # Add demo user config
    scheduler.add_user_config("demo_user", {
        "industry": "Clothing",
        "brand_name": "Demo Boutique",
        "owner_phone": os.getenv("OWNER_PHONE", ""),
        "owner_email": os.getenv("OWNER_EMAIL", ""),
        "supplier_email": os.getenv("SUPPLIER_EMAIL", ""),
        "supplier_name": "Main Supplier",
        "sheets_id": os.getenv("GOOGLE_SHEETS_ID", ""),
        "notion_db_id": os.getenv("NOTION_DB_ID", ""),
        "content_calendar_db_id": os.getenv("NOTION_CONTENT_DB_ID", ""),
        "reports_db_id": os.getenv("NOTION_REPORTS_DB_ID", ""),
        "ad_recommendations_db_id": os.getenv("NOTION_ADS_DB_ID", ""),
        "competitors": ["Competitor A", "Competitor B"],
        "target_audience": "Women 25-40"
    })
    scheduler.start()
    print("✅ Automation scheduler started")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down OmniAgent Backend...")
    if scheduler:
        scheduler.shutdown()

# Create FastAPI app
app = FastAPI(
    title="OmniAgent API",
    description="Multi-agent AI automation platform for small business owners",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wrap with Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# ============== AUTHENTICATION ENDPOINTS ==============

@app.post("/api/auth/signup", response_model=UserResponse)
async def signup(user: UserCreate):
    """Register a new user"""
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = uuid4()
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "password": user.password,  # Hash in production!
        "is_active": True,
        "created_at": datetime.now()
    }
    
    return UserResponse(
        id=user_id,
        email=user.email,
        is_active=True,
        created_at=datetime.now()
    )

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    """Login existing user"""
    if user.email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    db_user = users_db[user.email]
    if db_user["password"] != user.password:  # Verify hash in production!
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token (simplified - use JWT in production)
    return Token(access_token=f"mock_token_{user.email}")

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user info"""
    # Verify token and return user (simplified)
    token = credentials.credentials
    email = token.replace("mock_token_", "")
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db[email]
    return UserResponse(
        id=user["id"],
        email=user["email"],
        is_active=user["is_active"],
        created_at=user["created_at"]
    )

# ============== BUSINESS PROFILE ENDPOINTS ==============

@app.post("/api/auth/business-profile", response_model=BusinessProfileResponse)
async def create_business_profile(
    profile: BusinessProfileCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create or update business profile"""
    token = credentials.credentials
    email = token.replace("mock_token_", "")
    
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = users_db[email]["id"]
    profile_id = uuid4()
    
    business_profiles_db[str(user_id)] = {
        "id": profile_id,
        "user_id": user_id,
        **profile.dict(),
        "notion_connected": False,
        "gmail_connected": False,
        "sheets_connected": False,
        "created_at": datetime.now()
    }
    
    return BusinessProfileResponse(
        id=profile_id,
        user_id=user_id,
        **profile.dict(),
        notion_connected=False,
        gmail_connected=False,
        sheets_connected=False,
        created_at=datetime.now()
    )

@app.get("/api/auth/business-profile", response_model=BusinessProfileResponse)
async def get_business_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get user's business profile"""
    token = credentials.credentials
    email = token.replace("mock_token_", "")
    
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = str(users_db[email]["id"])
    if user_id not in business_profiles_db:
        raise HTTPException(status_code=404, detail="Business profile not found")
    
    profile = business_profiles_db[user_id]
    return BusinessProfileResponse(**profile)

# ============== AGENT PIPELINE ENDPOINTS ==============

@app.post("/api/run-goal", response_model=JobResponse)
async def run_goal(
    request: GoalRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Start agent pipeline for a goal"""
    token = credentials.credentials
    email = token.replace("mock_token_", "")
    
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = users_db[email]["id"]
    job_id = uuid4()
    
    job = {
        "id": job_id,
        "user_id": user_id,
        "goal_text": request.goal,
        "status": JobStatus.PENDING,
        "current_agent": None,
        "final_report": None,
        "notion_url": None,
        "confidence_score": None,
        "created_at": datetime.now(),
        "completed_at": None
    }
    
    jobs_db[str(job_id)] = job
    
    # Start pipeline in background
    asyncio.create_task(run_agent_pipeline(str(job_id), request.goal, user_id))
    
    return JobResponse(**job)

@app.get("/api/status/{job_id}", response_model=JobResponse)
async def get_job_status(
    job_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current job status"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResponse(**jobs_db[job_id])

@app.get("/api/report/{job_id}")
async def get_report(
    job_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get final report for a job"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs_db[job_id]
    if job["status"] != JobStatus.COMPLETE:
        raise HTTPException(status_code=400, detail="Job not complete yet")
    
    return {
        "job_id": job_id,
        "report": job["final_report"],
        "notion_url": job["notion_url"],
        "confidence_score": job["confidence_score"]
    }

# ============== FILE UPLOAD ENDPOINTS ==============

@app.post("/api/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Upload file for agent processing"""
    token = credentials.credentials
    email = token.replace("mock_token_", "")
    
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Save file (implement actual storage in production)
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    content = await file.read()
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    return FileUploadResponse(
        filename=file.filename,
        path=file_path,
        size=len(content),
        content_type=file.content_type
    )

# ============== AUTOMATION ENDPOINTS ==============

@app.get("/api/automations")
async def list_automations(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """List all 8 available automations from api.md"""
    return {
        "automations": [
            {
                "id": "order-management",
                "name": "Order Management",
                "description": "Automated order confirmations, shipping updates, and review requests",
                "status": "active",
                "schedule": "Triggered by Shopify webhooks",
                "apis": ["Shopify", "Gmail", "WhatsApp"],
                "category": "Order Management"
            },
            {
                "id": "inventory-management",
                "name": "Inventory Management",
                "description": "Daily stock checks with low stock alerts and auto-reorder emails",
                "status": "active",
                "schedule": "Daily at 6:00 AM IST",
                "apis": ["Shopify", "Google Sheets", "Gmail", "WhatsApp"],
                "category": "Inventory"
            },
            {
                "id": "customer-reengagement",
                "name": "Customer Re-engagement",
                "description": "Win back inactive customers with personalized offers",
                "status": "active",
                "schedule": "Weekly on Sunday at 10:00 AM IST",
                "apis": ["Shopify", "Gmail", "WhatsApp", "Google Sheets"],
                "category": "Marketing"
            },
            {
                "id": "social-media-content",
                "name": "Social Media Content",
                "description": "Generate and schedule 7 posts per week with trending hashtags",
                "status": "active",
                "schedule": "Weekly on Monday at 8:00 AM IST",
                "apis": ["Instagram", "Notion", "Brave Search"],
                "category": "Social Media"
            },
            {
                "id": "review-management",
                "name": "Review Management",
                "description": "Auto-respond to Google reviews with AI-generated replies",
                "status": "active",
                "schedule": "Every 2 hours",
                "apis": ["Google My Business", "WhatsApp"],
                "category": "Reputation"
            },
            {
                "id": "sales-analytics",
                "name": "Sales Analytics & Reporting",
                "description": "Weekly business reports with insights and best sellers",
                "status": "active",
                "schedule": "Weekly on Monday at 7:00 AM IST",
                "apis": ["Shopify", "Google Sheets", "Notion", "WhatsApp", "Gmail"],
                "category": "Analytics"
            },
            {
                "id": "ad-intelligence",
                "name": "Ad Campaign Intelligence",
                "description": "Monitor competitor ads and optimize your campaigns",
                "status": "active",
                "schedule": "Daily at 9:00 AM IST",
                "apis": ["Meta Ads", "Brave Search", "Notion", "WhatsApp"],
                "category": "Advertising"
            },
            {
                "id": "customer-support",
                "name": "Customer Support",
                "description": "Auto-answer common questions via Instagram DMs and WhatsApp",
                "status": "active",
                "schedule": "Every 30 minutes",
                "apis": ["Instagram", "WhatsApp", "Shopify"],
                "category": "Support"
            }
        ]
    }

@app.post("/api/automations/{automation_id}/trigger")
async def trigger_automation(
    automation_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Manually trigger an automation"""
    token = credentials.credentials
    email = token.replace("mock_token_", "")
    
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = str(users_db[email]["id"])
    
    # Map automation IDs to trigger methods
    automation_map = {
        "inventory-management": scheduler.trigger_inventory_check if scheduler else None,
        "customer-reengagement": scheduler.trigger_reengagement if scheduler else None,
        "social-media-content": scheduler.trigger_social_content if scheduler else None,
        "sales-analytics": scheduler.trigger_analytics if scheduler else None,
        "ad-intelligence": scheduler.trigger_ad_intelligence if scheduler else None,
        "review-management": scheduler.trigger_review_check if scheduler else None,
    }
    
    trigger_func = automation_map.get(automation_id)
    if not trigger_func:
        raise HTTPException(status_code=400, detail="Invalid automation ID or not triggerable")
    
    # Run the automation
    result = await trigger_func(user_id)
    
    return {
        "status": "triggered",
        "automation_id": automation_id,
        "result": result
    }

@app.get("/api/automations/scheduled-jobs")
async def get_scheduled_jobs(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get list of scheduled automation jobs"""
    if not scheduler:
        return {"jobs": []}
    
    return {"jobs": scheduler.get_scheduled_jobs()}

@app.get("/api/briefing/today")
async def get_daily_briefing(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get today's morning briefing"""
    # Get real data from Shopify
    from datetime import timedelta
    yesterday = datetime.now() - timedelta(days=1)
    analytics = shopify_client.get_analytics(
        start_date=yesterday.strftime("%Y-%m-%d"),
        end_date=datetime.now().strftime("%Y-%m-%d")
    )
    
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "revenue_yesterday": analytics.get("total_revenue", 0),
        "orders_yesterday": analytics.get("total_orders", 0),
        "best_product": analytics.get("best_sellers", [{}])[0].get("name", "N/A") if analytics.get("best_sellers") else "N/A",
        "new_reviews": 3,  # Would come from Google My Business API
        "stock_alerts": 0,  # Would come from inventory check
        "action": "Check your dashboard for detailed insights."
    }

# ============== WEBHOOK ENDPOINTS ==============

@app.post("/webhooks/shopify")
async def shopify_webhook(request: Request):
    """Handle Shopify webhooks"""
    try:
        # Get headers
        topic = request.headers.get("X-Shopify-Topic", "")
        signature = request.headers.get("X-Shopify-Hmac-Sha256", "")
        
        # Get body
        body = await request.body()
        data = json.loads(body)
        
        # Verify signature (optional in dev)
        # if not shopify_webhook_handler.verify_signature(body, signature):
        #     raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Get user config (would lookup by shop domain in production)
        user_config = {
            "industry": "Clothing",
            "brand_name": "Demo Boutique",
            "owner_phone": os.getenv("OWNER_PHONE", ""),
            "owner_email": os.getenv("OWNER_EMAIL", ""),
            "sheets_id": os.getenv("GOOGLE_SHEETS_ID", ""),
        }
        
        # Process webhook
        result = await shopify_webhook_handler.process_webhook(topic, data, user_config)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============== MCP API ENDPOINTS ==============

@app.get("/api/shopify/orders")
async def get_shopify_orders(
    limit: int = 50,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get orders from Shopify"""
    orders = shopify_client.get_orders(limit=limit)
    return {"orders": orders}

@app.get("/api/shopify/inventory")
async def get_shopify_inventory(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get inventory from Shopify"""
    inventory = shopify_client.get_inventory()
    return {"inventory": inventory}

@app.get("/api/instagram/insights")
async def get_instagram_insights(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get Instagram insights"""
    metrics = instagram_client.get_engagement_metrics(days=7)
    return {"insights": metrics}

@app.post("/api/support/handle-inquiry")
async def handle_support_inquiry(
    inquiry: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Handle a customer support inquiry"""
    token = credentials.credentials
    email = token.replace("mock_token_", "")
    
    user_config = {
        "industry": "Clothing",
        "brand_name": "Demo Boutique",
    }
    
    result = await support_automation.handle_inquiry(
        customer_id=inquiry.get("customer_id"),
        message=inquiry.get("message"),
        channel=inquiry.get("channel", "whatsapp"),
        user_config=user_config
    )
    
    return result

# ============== WEBSOCKET EVENTS ==============

@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"Client connected: {sid}")
    active_connections[sid] = {"connected_at": datetime.now()}

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client disconnected: {sid}")
    if sid in active_connections:
        del active_connections[sid]

@sio.on("subscribe_job")
async def subscribe_job(sid, data):
    """Subscribe to job updates"""
    job_id = data.get("job_id")
    if job_id:
        await sio.enter_room(sid, f"job_{job_id}")
        print(f"Client {sid} subscribed to job {job_id}")

@sio.on("unsubscribe_job")
async def unsubscribe_job(sid, data):
    """Unsubscribe from job updates"""
    job_id = data.get("job_id")
    if job_id:
        await sio.leave_room(sid, f"job_{job_id}")
        print(f"Client {sid} unsubscribed from job {job_id}")

# ============== AGENT PIPELINE SIMULATION ==============

async def run_agent_pipeline(job_id: str, goal: str, user_id: UUID):
    """Run the 6-agent pipeline with WebSocket events"""
    job = jobs_db[job_id]
    job["status"] = JobStatus.RUNNING
    
    agents_pipeline = [
        {"id": "planner", "name": "Planner", "delay": 2},
        {"id": "researcher", "name": "Researcher", "delay": 3},
        {"id": "analyst", "name": "Analyst", "delay": 3},
        {"id": "marketing", "name": "Marketing Analyst", "delay": 3},
        {"id": "writer", "name": "Writer", "delay": 3},
        {"id": "critic", "name": "Critic", "delay": 2},
    ]
    
    start_time = datetime.now()
    
    for agent in agents_pipeline:
        # Update current agent
        job["current_agent"] = agent["name"]
        
        # Emit agent_start event
        await sio.emit("agent_start", {
            "event": "agent_start",
            "agent": agent["id"],
            "message": f"{agent['name']} is working on your task...",
            "timestamp": datetime.now().isoformat()
        }, room=f"job_{job_id}")
        
        # Simulate work
        await asyncio.sleep(agent["delay"])
        
        # Emit agent_complete event
        confidence = 8.5 + (agent["id"] == "critic" and 0.7 or 0)
        await sio.emit("agent_complete", {
            "event": "agent_complete",
            "agent": agent["id"],
            "message": f"{agent['name']} completed their task",
            "confidence": confidence,
            "timestamp": datetime.now().isoformat()
        }, room=f"job_{job_id}")
    
    # Simulate Critic approval
    await sio.emit("critic_approve", {
        "event": "critic_approve",
        "final_confidence": 9.2,
        "message": "Quality check passed. Saving to Notion...",
        "timestamp": datetime.now().isoformat()
    }, room=f"job_{job_id}")
    
    await asyncio.sleep(1)
    
    # Simulate Notion save
    await sio.emit("notion_saved", {
        "event": "notion_saved",
        "notion_url": f"https://notion.so/page-{job_id}",
        "timestamp": datetime.now().isoformat()
    }, room=f"job_{job_id}")
    
    # Complete job
    total_time = (datetime.now() - start_time).seconds
    job["status"] = JobStatus.COMPLETE
    job["current_agent"] = None
    job["final_report"] = f"Report for: {goal}"
    job["notion_url"] = f"https://notion.so/page-{job_id}"
    job["confidence_score"] = 9.2
    job["completed_at"] = datetime.now()
    
    # Emit pipeline_complete
    await sio.emit("pipeline_complete", {
        "event": "pipeline_complete",
        "job_id": job_id,
        "total_time_seconds": total_time,
        "final_score": 9.2,
        "outputs": {
            "report_url": f"https://notion.so/page-{job_id}",
            "emails_drafted": 3,
            "posts_created": 7,
            "whatsapp_messages": 2
        },
        "timestamp": datetime.now().isoformat()
    }, room=f"job_{job_id}")

# ============== MAIN ENTRY POINT ==============

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run(socket_app, host="0.0.0.0", port=port)
