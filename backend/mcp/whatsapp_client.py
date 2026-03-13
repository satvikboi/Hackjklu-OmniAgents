"""
WhatsApp Business API Client - Customer Communication
"""

import os
import requests
from typing import Dict, Any, Optional

class WhatsAppClient:
    """Client for WhatsApp Business API"""
    
    def __init__(self):
        self.api_token = os.getenv("WHATSAPP_API_TOKEN", "")
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        self.base_url = "https://graph.facebook.com/v18.0"
        
    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    def send_text_message(self, to: str, message: str) -> bool:
        """Send text message to customer"""
        try:
            url = f"{self.base_url}/{self.phone_number_id}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": to,
                "type": "text",
                "text": {"body": message}
            }
            response = requests.post(url, headers=self._headers(), json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"WhatsApp send_text_message error: {e}")
            return False
    
    def send_template_message(self, to: str, template_name: str, language_code: str = "en", 
                             components: Optional[list] = None) -> bool:
        """Send template message"""
        try:
            url = f"{self.base_url}/{self.phone_number_id}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": to,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": language_code}
                }
            }
            if components:
                payload["template"]["components"] = components
            
            response = requests.post(url, headers=self._headers(), json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"WhatsApp send_template_message error: {e}")
            return False
    
    def send_order_confirmation(self, to: str, customer_name: str, order_id: str, 
                                amount: str, items: list) -> bool:
        """Send order confirmation message"""
        message = f"Hi {customer_name}! 👋\n\n"
        message += f"✅ Order Confirmed!\n"
        message += f"Order ID: #{order_id}\n"
        message += f"Amount: ₹{amount}\n\n"
        message += "Items:\n"
        for item in items:
            message += f"• {item}\n"
        message += "\nWe'll keep you updated on shipping. Thank you for shopping with us! 🙏"
        
        return self.send_text_message(to, message)
    
    def send_shipping_update(self, to: str, customer_name: str, order_id: str, 
                             tracking_number: str, courier: str) -> bool:
        """Send shipping update with tracking"""
        message = f"Hi {customer_name}! 📦\n\n"
        message += f"Your order #{order_id} has been shipped!\n\n"
        message += f"Courier: {courier}\n"
        message += f"Tracking: {tracking_number}\n\n"
        message += "Track your order here: https://track.example.com\n\n"
        message += "Thank you for your patience! 🙏"
        
        return self.send_text_message(to, message)
    
    def send_review_request(self, to: str, customer_name: str, order_id: str) -> bool:
        """Request review after delivery"""
        message = f"Hi {customer_name}! 🌟\n\n"
        message += f"We hope you're enjoying your order #{order_id}!\n\n"
        message += "Could you take a moment to share your experience?\n"
        message += "Your feedback helps us improve! 🙏\n\n"
        message += "Leave a review: https://reviews.example.com\n\n"
        message += "Thank you for choosing us!"
        
        return self.send_text_message(to, message)
    
    def send_low_stock_alert(self, to: str, product_name: str, current_stock: int) -> bool:
        """Send low stock alert to owner"""
        message = f"⚠️ LOW STOCK ALERT\n\n"
        message += f"Product: {product_name}\n"
        message += f"Current Stock: {current_stock} units\n\n"
        message += "Please reorder soon to avoid stockout!"
        
        return self.send_text_message(to, message)
    
    def send_weekly_report_summary(self, to: str, report_summary: Dict[str, Any]) -> bool:
        """Send weekly report summary"""
        message = "📊 Weekly Business Report\n\n"
        message += f"Revenue: ₹{report_summary.get('revenue', 0):,.2f}\n"
        message += f"Orders: {report_summary.get('orders', 0)}\n"
        message += f"Avg Order Value: ₹{report_summary.get('aov', 0):,.2f}\n\n"
        
        if report_summary.get('best_seller'):
            message += f"🏆 Best Seller: {report_summary['best_seller']}\n\n"
        
        message += "View full report in your dashboard."
        
        return self.send_text_message(to, message)
