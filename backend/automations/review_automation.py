"""
Automation #5: Review Management Automation
Monitors and responds to Google reviews
"""

from typing import Dict, Any, List
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.whatsapp_client import WhatsAppClient
from mcp.gmail_client import GmailClient
from agents.writer_agent import WriterAgent
from agents.critic_agent import CriticAgent

class ReviewAutomation:
    """Automates review management"""
    
    def __init__(self, whatsapp: WhatsAppClient, gmail: GmailClient,
                 writer: WriterAgent, critic: CriticAgent):
        self.whatsapp = whatsapp
        self.gmail = gmail
        self.writer = writer
        self.critic = critic
        # Google My Business API would be initialized here
        
    async def check_reviews(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check for new reviews and respond"""
        try:
            # In production, this would fetch from Google My Business API
            # For now, simulating the workflow
            
            # Mock reviews for demonstration
            mock_reviews = [
                {"id": "r1", "rating": 5, "text": "Great products!", "reviewer": "Rahul"},
                {"id": "r2", "rating": 2, "text": "Late delivery", "reviewer": "Priya"},
            ]
            
            responses = []
            urgent_alerts = []
            
            for review in mock_reviews:
                rating = review.get("rating", 0)
                
                # Classify review
                if rating == 5:
                    response_type = "thank_you"
                elif rating == 4:
                    response_type = "thank_feedback"
                elif rating == 3:
                    response_type = "empathetic"
                else:
                    response_type = "urgent"
                    urgent_alerts.append(review)
                
                # Generate response using Writer Agent
                response_prompt = f"""
                Write a response to a {rating}-star Google review.
                Review: "{review.get('text', '')}"
                Reviewer: {review.get('reviewer', 'Customer')}
                Response type: {response_type}
                Keep it professional, warm, and under 200 characters.
                """
                
                response_result = await self.writer.run({
                    "content_type": "review_response",
                    "prompt": response_prompt,
                    "tone": "professional"
                })
                
                response_text = response_result.get("content", "Thank you for your feedback!")
                
                # Critic review
                critic_result = await self.critic.run({
                    "content": response_text,
                    "content_type": "review_response"
                })
                
                if critic_result.get("decision") == "approved":
                    responses.append({
                        "review_id": review.get("id"),
                        "rating": rating,
                        "response": response_text,
                        "status": "ready_to_post"
                    })
                else:
                    responses.append({
                        "review_id": review.get("id"),
                        "rating": rating,
                        "response": response_text,
                        "status": "needs_revision",
                        "feedback": critic_result.get("feedback", "")
                    })
            
            # Send urgent alerts for 1-2 star reviews
            if urgent_alerts and user_config.get("owner_phone"):
                alert_message = f"⚠️ {len(urgent_alerts)} negative review(s) need your attention!"
                self.whatsapp.send_text_message(
                    to=user_config.get("owner_phone"),
                    message=alert_message
                )
            
            return {
                "status": "success",
                "reviews_checked": len(mock_reviews),
                "responses_generated": len(responses),
                "urgent_reviews": len(urgent_alerts),
                "responses": responses,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def run_review_check(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run review check (scheduled every 2 hours)"""
        return await self.check_reviews(user_config)
