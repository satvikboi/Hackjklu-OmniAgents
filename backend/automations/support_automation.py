"""
Automation #8: Customer Support Automation
Handles common customer inquiries automatically
"""

from typing import Dict, Any, List
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.instagram_client import InstagramClient
from mcp.whatsapp_client import WhatsAppClient
from mcp.shopify_client import ShopifyClient
from agents.writer_agent import WriterAgent

class SupportAutomation:
    """Automates customer support responses"""
    
    def __init__(self, instagram: InstagramClient, whatsapp: WhatsAppClient,
                 shopify: ShopifyClient, writer: WriterAgent):
        self.instagram = instagram
        self.whatsapp = whatsapp
        self.shopify = shopify
        self.writer = writer
        
        # Common FAQ responses
        self.faq_responses = {
            "size_chart": """
            Here's our size chart:
            S: Chest 36" | Length 26"
            M: Chest 38" | Length 27"
            L: Chest 40" | Length 28"
            XL: Chest 42" | Length 29"
            XXL: Chest 44" | Length 30"
            
            Not sure? Message us your measurements! 📏
            """,
            
            "delivery_time": """
            Standard delivery: 3-5 business days
            Express delivery: 1-2 business days (₹99 extra)
            
            You'll receive tracking details once shipped! 📦
            """,
            
            "return_policy": """
            Return Policy:
            ✅ 7-day easy returns
            ✅ Exchange available for size issues
            ✅ Full refund on defective items
            
            To initiate a return, reply with your order number! 🔄
            """,
            
            "payment": """
            We accept:
            💳 UPI (Google Pay, PhonePe, Paytm)
            💳 Credit/Debit Cards
            💳 Net Banking
            💳 Cash on Delivery (₹49 extra)
            
            100% secure payments! 🔒
            """,
            
            "track_order": None  # Dynamic response based on order
        }
        
    def detect_intent(self, message: str) -> str:
        """Detect customer intent from message"""
        message_lower = message.lower()
        
        intents = {
            "size_chart": ["size", "chart", "measurement", "fit", "sizing"],
            "delivery_time": ["delivery", "shipping", "how long", "when will", "arrive"],
            "return_policy": ["return", "exchange", "refund", "policy"],
            "payment": ["payment", "pay", "cod", "cash", "upi"],
            "track_order": ["track", "order status", "where is", "tracking"],
            "order_status": ["order", "status", "shipped", "delivered"]
        }
        
        for intent, keywords in intents.items():
            if any(keyword in message_lower for keyword in keywords):
                return intent
        
        return "general"
    
    async def handle_inquiry(self, customer_id: str, message: str, 
                            channel: str, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Handle a customer inquiry"""
        try:
            intent = self.detect_intent(message)
            
            # Handle order tracking (needs dynamic data)
            if intent == "track_order" or intent == "order_status":
                # Extract order number if provided
                import re
                order_match = re.search(r'#?(\d+)', message)
                
                if order_match:
                    order_id = order_match.group(1)
                    order = self.shopify.get_order(order_id)
                    
                    if order:
                        fulfillment_status = order.get("fulfillment_status", "unfulfilled")
                        tracking = order.get("fulfillments", [{}])[0].get("tracking_number", "N/A")
                        
                        if fulfillment_status == "fulfilled":
                            response = f"Your order #{order_id} has been shipped! 📦\nTracking: {tracking}\nTrack here: https://track.example.com"
                        else:
                            response = f"Your order #{order_id} is being processed. We'll update you once shipped! 🔄"
                    else:
                        response = "I couldn't find that order. Please check the order number and try again."
                else:
                    response = "Please provide your order number (e.g., #12345) so I can check the status!"
            
            # Handle FAQ responses
            elif intent in self.faq_responses and self.faq_responses[intent]:
                response = self.faq_responses[intent]
            
            # General inquiry - use Writer Agent
            else:
                prompt = f"""
                A customer asked: "{message}"
                
                Provide a helpful, friendly response for a clothing brand.
                Keep it concise (under 150 words) and professional.
                """
                
                writer_result = await self.writer.run({
                    "content_type": "support_response",
                    "prompt": prompt,
                    "tone": "friendly"
                })
                
                response = writer_result.get("content", "Thank you for reaching out! Our team will get back to you shortly.")
            
            # Send response
            if channel == "whatsapp" and customer_id:
                self.whatsapp.send_text_message(to=customer_id, message=response)
            elif channel == "instagram":
                self.instagram.reply_to_dm(user_id=customer_id, message=response)
            
            return {
                "status": "success",
                "intent": intent,
                "response_sent": True,
                "channel": channel,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def process_pending_inquiries(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Process pending customer inquiries"""
        try:
            # In production, fetch from Instagram/WhatsApp APIs
            # Mock pending inquiries for demonstration
            mock_inquiries = [
                {"customer_id": "c1", "message": "What's your size chart?", "channel": "instagram"},
                {"customer_id": "c2", "message": "Where is my order #12345?", "channel": "whatsapp"},
            ]
            
            processed = []
            
            for inquiry in mock_inquiries:
                result = await self.handle_inquiry(
                    inquiry["customer_id"],
                    inquiry["message"],
                    inquiry["channel"],
                    user_config
                )
                processed.append(result)
            
            return {
                "status": "success",
                "inquiries_processed": len(processed),
                "results": processed,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def run_support_check(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run support automation check (can be triggered frequently)"""
        return await self.process_pending_inquiries(user_config)
