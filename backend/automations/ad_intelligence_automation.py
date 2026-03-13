"""
Automation #7: Ad Campaign Intelligence Automation
Monitors competitor ads and analyzes ad performance
"""

from typing import Dict, Any, List
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.notion_client import NotionClient
from mcp.whatsapp_client import WhatsAppClient
from mcp.search_client import BraveSearchClient
from agents.marketing_analyst_agent import MarketingAnalystAgent
from agents.writer_agent import WriterAgent

class AdIntelligenceAutomation:
    """Automates ad campaign intelligence"""
    
    def __init__(self, notion: NotionClient, whatsapp: WhatsAppClient,
                 search: BraveSearchClient, marketing: MarketingAnalystAgent,
                 writer: WriterAgent):
        self.notion = notion
        self.whatsapp = whatsapp
        self.search = search
        self.marketing = marketing
        self.writer = writer
        # Meta Ads API would be initialized here
        
    async def analyze_competitor_ads(self, competitors: List[str], 
                                     industry: str) -> Dict[str, Any]:
        """Research competitor advertising strategies"""
        try:
            competitor_insights = []
            
            for competitor in competitors:
                # Research competitor
                insights = self.search.research_competitor(competitor, industry)
                competitor_insights.append(insights)
            
            return {
                "competitors_analyzed": len(competitors),
                "insights": competitor_insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def analyze_ad_performance(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze ad performance and generate recommendations"""
        try:
            # In production, fetch from Meta Ads API
            # Mock data for demonstration
            mock_campaigns = [
                {"id": "c1", "name": "Summer Sale", "ctr": 0.8, "roas": 2.5},
                {"id": "c2", "name": "New Arrivals", "ctr": 1.2, "roas": 3.2},
                {"id": "c3", "name": "Retargeting", "ctr": 0.5, "roas": 1.8},
            ]
            
            flagged_campaigns = []
            recommendations = []
            
            for campaign in mock_campaigns:
                # Check thresholds
                if campaign["ctr"] < 1.0:
                    flagged_campaigns.append({
                        **campaign,
                        "issue": "Low CTR",
                        "recommendation": "Refresh ad creative or targeting"
                    })
                
                if campaign["roas"] < 2.0:
                    flagged_campaigns.append({
                        **campaign,
                        "issue": "Low ROAS",
                        "recommendation": "Consider pausing or optimizing"
                    })
            
            # Generate new ad copy ideas using Writer Agent
            if flagged_campaigns:
                ad_copy_prompt = f"""
                Create 3 new ad copy variations for a {user_config.get('industry', 'clothing')} brand.
                Current campaigns are underperforming with low CTR.
                Include compelling headlines and CTAs.
                """
                
                ad_copy_result = await self.writer.run({
                    "content_type": "ad_copy",
                    "prompt": ad_copy_prompt,
                    "tone": "persuasive"
                })
                
                recommendations.append({
                    "title": "New Ad Copy Ideas",
                    "description": "Fresh creative concepts for underperforming campaigns",
                    "content": ad_copy_result.get("content", ""),
                    "priority": "High",
                    "actions": [
                        "Test new headlines",
                        "Refresh ad images",
                        "Adjust targeting"
                    ]
                })
            
            # Research competitors
            competitors = user_config.get("competitors", [])
            if competitors:
                competitor_data = await self.analyze_competitor_ads(
                    competitors, 
                    user_config.get("industry", "clothing")
                )
                
                recommendations.append({
                    "title": "Competitor Analysis",
                    "description": f"Analyzed {len(competitors)} competitors' ad strategies",
                    "priority": "Medium",
                    "actions": [
                        "Review competitor messaging",
                        "Identify gap opportunities",
                        "Benchmark performance"
                    ]
                })
            
            # Store recommendations in Notion
            notion_ids = self.notion.create_ad_recommendations(
                user_config.get("ad_recommendations_db_id"),
                recommendations
            )
            
            # Send alert if campaigns need attention
            if flagged_campaigns and user_config.get("owner_phone"):
                alert_message = f"📊 Ad Alert: {len(flagged_campaigns)} campaign(s) need attention. Check your dashboard."
                self.whatsapp.send_text_message(
                    to=user_config.get("owner_phone"),
                    message=alert_message
                )
            
            return {
                "status": "success",
                "campaigns_analyzed": len(mock_campaigns),
                "flagged_campaigns": len(flagged_campaigns),
                "recommendations_created": len(notion_ids),
                "recommendations": recommendations,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def run_daily_ad_check(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run daily ad intelligence check (scheduled at 9 AM)"""
        return await self.analyze_ad_performance(user_config)
