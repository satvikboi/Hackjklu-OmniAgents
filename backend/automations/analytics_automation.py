"""
Automation #6: Sales Analytics & Reporting Automation
Generates weekly business reports
"""

from typing import Dict, Any
from datetime import datetime, timedelta
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.shopify_client import ShopifyClient
from mcp.sheets_client import GoogleSheetsClient
from mcp.notion_client import NotionClient
from mcp.whatsapp_client import WhatsAppClient
from mcp.gmail_client import GmailClient
from agents.analyst_agent import AnalystAgent
from agents.writer_agent import WriterAgent
from agents.critic_agent import CriticAgent

class AnalyticsAutomation:
    """Automates sales analytics and reporting"""
    
    def __init__(self, shopify: ShopifyClient, sheets: GoogleSheetsClient,
                 notion: NotionClient, whatsapp: WhatsAppClient,
                 gmail: GmailClient, analyst: AnalystAgent,
                 writer: WriterAgent, critic: CriticAgent):
        self.shopify = shopify
        self.sheets = sheets
        self.notion = notion
        self.whatsapp = whatsapp
        self.gmail = gmail
        self.analyst = analyst
        self.writer = writer
        self.critic = critic
        
    async def generate_weekly_report(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive weekly report"""
        try:
            # Calculate date range (last week)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)
            
            # Get analytics from Shopify
            analytics = self.shopify.get_analytics(
                start_date=start_date.strftime("%Y-%m-%d"),
                end_date=end_date.strftime("%Y-%m-%d")
            )
            
            # Get data from Sheets for comparison
            sheets_data = self.sheets.get_weekly_report_data(
                user_config.get("sheets_id"),
                start_date.strftime("%Y-%m-%d")
            )
            
            # Analyze with Analyst Agent
            analysis_prompt = f"""
            Analyze this week's business performance:
            Revenue: ₹{analytics.get('total_revenue', 0):,.2f}
            Orders: {analytics.get('total_orders', 0)}
            AOV: ₹{analytics.get('average_order_value', 0):,.2f}
            Best Sellers: {', '.join([item['name'] for item in analytics.get('best_sellers', [])[:3]])}
            
            Provide insights on:
            1. Revenue trends
            2. Product performance
            3. Areas for improvement
            """
            
            analysis_result = await self.analyst.run({
                "data": analytics,
                "analysis_type": "weekly_report",
                "prompt": analysis_prompt
            })
            
            # Generate report content with Writer Agent
            report_data = {
                "title": f"Weekly Business Report - Week of {start_date.strftime('%b %d')}",
                "week_start": start_date.isoformat(),
                "revenue": analytics.get('total_revenue', 0),
                "orders": analytics.get('total_orders', 0),
                "aov": analytics.get('average_order_value', 0),
                "best_sellers": analytics.get('best_sellers', []),
                "summary": analysis_result.get("insights", "")
            }
            
            # Create report in Notion
            notion_page_id = self.notion.create_report(
                user_config.get("reports_db_id"),
                report_data
            )
            
            # Send summary via WhatsApp
            if user_config.get("owner_phone"):
                self.whatsapp.send_weekly_report_summary(
                    to=user_config.get("owner_phone"),
                    report_summary={
                        "revenue": analytics.get('total_revenue', 0),
                        "orders": analytics.get('total_orders', 0),
                        "aov": analytics.get('average_order_value', 0),
                        "best_seller": analytics.get('best_sellers', [{}])[0].get('name', 'N/A')
                    }
                )
            
            # Send detailed report via email
            if user_config.get("owner_email"):
                self.gmail.send_weekly_report(
                    to=user_config.get("owner_email"),
                    report_data=report_data
                )
            
            return {
                "status": "success",
                "report_title": report_data["title"],
                "revenue": analytics.get('total_revenue', 0),
                "orders": analytics.get('total_orders', 0),
                "notion_page_id": notion_page_id,
                "insights": analysis_result.get("insights", ""),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def run_weekly_analytics(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run weekly analytics (scheduled on Mondays at 7 AM)"""
        return await self.generate_weekly_report(user_config)
