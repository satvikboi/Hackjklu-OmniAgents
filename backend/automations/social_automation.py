"""
Automation #4: Social Media Content Automation
Generates and schedules weekly social media content
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.instagram_client import InstagramClient
from mcp.notion_client import NotionClient
from mcp.search_client import BraveSearchClient
from agents.writer_agent import WriterAgent
from agents.marketing_analyst_agent import MarketingAnalystAgent
from agents.critic_agent import CriticAgent

class SocialAutomation:
    """Automates social media content creation and scheduling"""
    
    def __init__(self, instagram: InstagramClient, notion: NotionClient,
                 search: BraveSearchClient, writer: WriterAgent,
                 marketing: MarketingAnalystAgent, critic: CriticAgent):
        self.instagram = instagram
        self.notion = notion
        self.search = search
        self.writer = writer
        self.marketing = marketing
        self.critic = critic
        
    async def generate_weekly_content(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a week of social media content"""
        try:
            industry = user_config.get("industry", "Clothing")
            brand_name = user_config.get("brand_name", "Your Brand")
            
            # Get previous week's performance
            previous_metrics = self.instagram.get_engagement_metrics(days=7)
            
            # Research trending hashtags
            trending_hashtags = self.search.find_trending_hashtags(industry)
            
            # Research content ideas
            content_ideas = self.search.find_content_ideas(
                industry, 
                user_config.get("target_audience", "Young adults")
            )
            
            # Generate 7 posts for the week
            content_items = []
            post_types = [
                "Product showcase",
                "Behind the scenes", 
                "Customer testimonial",
                "Educational/Tips",
                "User generated content",
                "Promotional offer",
                "Weekend vibes"
            ]
            
            for i, post_type in enumerate(post_types):
                # Generate caption using Writer Agent
                caption_prompt = f"""
                Create an Instagram caption for a {industry} brand called {brand_name}.
                Post type: {post_type}
                Day: {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}
                Include a hook, engaging caption, call-to-action, and relevant hashtags.
                Trending hashtags to consider: {', '.join(trending_hashtags[:5])}
                """
                
                caption_result = await self.writer.run({
                    "content_type": "instagram_caption",
                    "prompt": caption_prompt,
                    "tone": "friendly and engaging"
                })
                
                content_items.append({
                    "title": f"{post_type} - {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}",
                    "caption": caption_result.get("content", ""),
                    "hashtags": trending_hashtags[:15],
                    "platform": "Instagram",
                    "post_type": post_type,
                    "image_prompt": f"{industry} {post_type} aesthetic image"
                })
            
            # Schedule the content
            scheduled = self.instagram.schedule_content(content_items)
            
            # Save to Notion content calendar
            notion_ids = self.notion.create_content_calendar(
                user_config.get("content_calendar_db_id"),
                content_items
            )
            
            return {
                "status": "success",
                "posts_generated": len(content_items),
                "scheduled": scheduled,
                "notion_pages_created": len(notion_ids),
                "previous_week_metrics": previous_metrics,
                "trending_hashtags": trending_hashtags[:10],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def run_weekly_content_generation(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run weekly content generation (scheduled on Mondays at 8 AM)"""
        return await self.generate_weekly_content(user_config)
