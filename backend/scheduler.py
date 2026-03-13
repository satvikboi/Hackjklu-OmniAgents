"""
Automation Scheduler - Manages all scheduled automation tasks
"""

import asyncio
from typing import Dict, Any
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from mcp.shopify_client import ShopifyClient
from mcp.whatsapp_client import WhatsAppClient
from mcp.gmail_client import GmailClient
from mcp.instagram_client import InstagramClient
from mcp.sheets_client import GoogleSheetsClient
from mcp.notion_client import NotionClient
from mcp.search_client import BraveSearchClient

from agents.planner_agent import PlannerAgent
from agents.researcher_agent import ResearcherAgent
from agents.analyst_agent import AnalystAgent
from agents.marketing_analyst_agent import MarketingAnalystAgent
from agents.writer_agent import WriterAgent
from agents.critic_agent import CriticAgent

from automations.order_automation import OrderAutomation
from automations.inventory_automation import InventoryAutomation
from automations.reengagement_automation import ReengagementAutomation
from automations.social_automation import SocialAutomation
from automations.review_automation import ReviewAutomation
from automations.analytics_automation import AnalyticsAutomation
from automations.ad_intelligence_automation import AdIntelligenceAutomation
from automations.support_automation import SupportAutomation


class AutomationScheduler:
    """Scheduler for all automation workflows"""
    
    def __init__(self, sio=None):
        self.scheduler = AsyncIOScheduler()
        self.sio = sio
        
        # Initialize MCP clients
        self.shopify = ShopifyClient()
        self.whatsapp = WhatsAppClient()
        self.gmail = GmailClient()
        self.instagram = InstagramClient()
        self.sheets = GoogleSheetsClient()
        self.notion = NotionClient()
        self.search = BraveSearchClient()
        
        # Initialize agents
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()
        self.analyst = AnalystAgent()
        self.marketing = MarketingAnalystAgent()
        self.writer = WriterAgent()
        self.critic = CriticAgent()
        
        # Initialize automations
        self.order_automation = OrderAutomation(
            self.shopify, self.whatsapp, self.gmail, 
            self.sheets, self.writer, self.critic
        )
        self.inventory_automation = InventoryAutomation(
            self.shopify, self.whatsapp, self.gmail, 
            self.sheets, self.analyst
        )
        self.reengagement_automation = ReengagementAutomation(
            self.shopify, self.whatsapp, self.gmail, 
            self.sheets, self.writer
        )
        self.social_automation = SocialAutomation(
            self.instagram, self.notion, self.search,
            self.writer, self.marketing, self.critic
        )
        self.review_automation = ReviewAutomation(
            self.whatsapp, self.gmail, self.writer, self.critic
        )
        self.analytics_automation = AnalyticsAutomation(
            self.shopify, self.sheets, self.notion,
            self.whatsapp, self.gmail, self.analyst,
            self.writer, self.critic
        )
        self.ad_intelligence_automation = AdIntelligenceAutomation(
            self.notion, self.whatsapp, self.search,
            self.marketing, self.writer
        )
        self.support_automation = SupportAutomation(
            self.instagram, self.whatsapp, self.shopify, self.writer
        )
        
        # User configurations (would be loaded from database)
        self.user_configs: Dict[str, Dict[str, Any]] = {}
    
    def add_user_config(self, user_id: str, config: Dict[str, Any]):
        """Add user configuration for automations"""
        self.user_configs[user_id] = config
    
    async def _emit_event(self, event_type: str, data: Dict[str, Any]):
        """Emit WebSocket event"""
        if self.sio:
            await self.sio.emit("automation_event", {
                "event": event_type,
                "data": data,
                "timestamp": datetime.now().isoformat()
            })
    
    # ===== Scheduled Tasks =====
    
    async def run_inventory_check(self):
        """Daily inventory check at 6:00 AM"""
        print("[SCHEDULER] Running daily inventory check...")
        await self._emit_event("inventory_check_started", {})
        
        for user_id, config in self.user_configs.items():
            result = await self.inventory_automation.run_daily_check(config)
            await self._emit_event("inventory_check_completed", {
                "user_id": user_id,
                "result": result
            })
    
    async def run_reengagement(self):
        """Weekly re-engagement on Sundays at 10:00 AM"""
        print("[SCHEDULER] Running weekly re-engagement...")
        await self._emit_event("reengagement_started", {})
        
        for user_id, config in self.user_configs.items():
            result = await self.reengagement_automation.run_weekly_reengagement(config)
            await self._emit_event("reengagement_completed", {
                "user_id": user_id,
                "result": result
            })
    
    async def run_social_content_generation(self):
        """Weekly social content on Mondays at 8:00 AM"""
        print("[SCHEDULER] Running weekly social content generation...")
        await self._emit_event("social_content_started", {})
        
        for user_id, config in self.user_configs.items():
            result = await self.social_automation.run_weekly_content_generation(config)
            await self._emit_event("social_content_completed", {
                "user_id": user_id,
                "result": result
            })
    
    async def run_review_check(self):
        """Review check every 2 hours"""
        print("[SCHEDULER] Running review check...")
        
        for user_id, config in self.user_configs.items():
            result = await self.review_automation.run_review_check(config)
            if result.get("urgent_reviews", 0) > 0:
                await self._emit_event("urgent_reviews_found", {
                    "user_id": user_id,
                    "count": result["urgent_reviews"]
                })
    
    async def run_weekly_analytics(self):
        """Weekly analytics report on Mondays at 7:00 AM"""
        print("[SCHEDULER] Running weekly analytics...")
        await self._emit_event("analytics_started", {})
        
        for user_id, config in self.user_configs.items():
            result = await self.analytics_automation.run_weekly_analytics(config)
            await self._emit_event("analytics_completed", {
                "user_id": user_id,
                "result": result
            })
    
    async def run_ad_intelligence(self):
        """Daily ad intelligence at 9:00 AM"""
        print("[SCHEDULER] Running daily ad intelligence...")
        await self._emit_event("ad_intelligence_started", {})
        
        for user_id, config in self.user_configs.items():
            result = await self.ad_intelligence_automation.run_daily_ad_check(config)
            await self._emit_event("ad_intelligence_completed", {
                "user_id": user_id,
                "result": result
            })
    
    async def run_support_check(self):
        """Support check every 30 minutes"""
        for user_id, config in self.user_configs.items():
            result = await self.support_automation.run_support_check(config)
            if result.get("inquiries_processed", 0) > 0:
                await self._emit_event("support_inquiries_processed", {
                    "user_id": user_id,
                    "count": result["inquiries_processed"]
                })
    
    # ===== Scheduler Management =====
    
    def start(self):
        """Start the scheduler with all jobs"""
        # Daily at 6:00 AM - Inventory Check
        self.scheduler.add_job(
            self.run_inventory_check,
            CronTrigger(hour=6, minute=0),
            id="inventory_check",
            replace_existing=True
        )
        
        # Sundays at 10:00 AM - Re-engagement
        self.scheduler.add_job(
            self.run_reengagement,
            CronTrigger(day_of_week="sun", hour=10, minute=0),
            id="reengagement",
            replace_existing=True
        )
        
        # Mondays at 8:00 AM - Social Content
        self.scheduler.add_job(
            self.run_social_content_generation,
            CronTrigger(day_of_week="mon", hour=8, minute=0),
            id="social_content",
            replace_existing=True
        )
        
        # Every 2 hours - Review Check
        self.scheduler.add_job(
            self.run_review_check,
            CronTrigger(hour="*/2"),
            id="review_check",
            replace_existing=True
        )
        
        # Mondays at 7:00 AM - Weekly Analytics
        self.scheduler.add_job(
            self.run_weekly_analytics,
            CronTrigger(day_of_week="mon", hour=7, minute=0),
            id="weekly_analytics",
            replace_existing=True
        )
        
        # Daily at 9:00 AM - Ad Intelligence
        self.scheduler.add_job(
            self.run_ad_intelligence,
            CronTrigger(hour=9, minute=0),
            id="ad_intelligence",
            replace_existing=True
        )
        
        # Every 30 minutes - Support Check
        self.scheduler.add_job(
            self.run_support_check,
            CronTrigger(minute="*/30"),
            id="support_check",
            replace_existing=True
        )
        
        self.scheduler.start()
        print("[SCHEDULER] Automation scheduler started")
    
    def shutdown(self):
        """Shutdown the scheduler"""
        self.scheduler.shutdown()
        print("[SCHEDULER] Automation scheduler stopped")
    
    def get_scheduled_jobs(self) -> list:
        """Get list of scheduled jobs"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            })
        return jobs
    
    # ===== Manual Trigger Methods =====
    
    async def trigger_inventory_check(self, user_id: str) -> Dict[str, Any]:
        """Manually trigger inventory check"""
        config = self.user_configs.get(user_id, {})
        return await self.inventory_automation.run_daily_check(config)
    
    async def trigger_reengagement(self, user_id: str) -> Dict[str, Any]:
        """Manually trigger re-engagement"""
        config = self.user_configs.get(user_id, {})
        return await self.reengagement_automation.run_weekly_reengagement(config)
    
    async def trigger_social_content(self, user_id: str) -> Dict[str, Any]:
        """Manually trigger social content generation"""
        config = self.user_configs.get(user_id, {})
        return await self.social_automation.run_weekly_content_generation(config)
    
    async def trigger_analytics(self, user_id: str) -> Dict[str, Any]:
        """Manually trigger analytics report"""
        config = self.user_configs.get(user_id, {})
        return await self.analytics_automation.run_weekly_analytics(config)
    
    async def trigger_ad_intelligence(self, user_id: str) -> Dict[str, Any]:
        """Manually trigger ad intelligence"""
        config = self.user_configs.get(user_id, {})
        return await self.ad_intelligence_automation.run_daily_ad_check(config)
    
    async def trigger_review_check(self, user_id: str) -> Dict[str, Any]:
        """Manually trigger review check"""
        config = self.user_configs.get(user_id, {})
        return await self.review_automation.run_review_check(config)
