"""
Automation #3: Customer Re-engagement Automation
Re-engages inactive customers with personalized offers
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.shopify_client import ShopifyClient
from mcp.whatsapp_client import WhatsAppClient
from mcp.gmail_client import GmailClient
from mcp.sheets_client import GoogleSheetsClient
from agents.writer_agent import WriterAgent

class ReengagementAutomation:
    """Automates customer re-engagement"""
    
    def __init__(self, shopify: ShopifyClient, whatsapp: WhatsAppClient,
                 gmail: GmailClient, sheets: GoogleSheetsClient,
                 writer: WriterAgent):
        self.shopify = shopify
        self.whatsapp = whatsapp
        self.gmail = gmail
        self.sheets = sheets
        self.writer = writer
        
    async def find_inactive_customers(self, days: int = 30) -> List[Dict[str, Any]]:
        """Find customers inactive for specified days"""
        try:
            customers = self.shopify.get_customers(limit=250)
            inactive_customers = []
            
            cutoff_date = datetime.now() - timedelta(days=days)
            
            for customer in customers:
                # Get customer's last order
                orders = self.shopify.get_customer_orders(customer.get("id"))
                
                if not orders:
                    # Never ordered - skip or handle differently
                    continue
                
                # Find most recent order
                last_order_date = None
                for order in orders:
                    order_date_str = order.get("created_at", "")
                    if order_date_str:
                        order_date = datetime.fromisoformat(order_date_str.replace("Z", "+00:00"))
                        if not last_order_date or order_date > last_order_date:
                            last_order_date = order_date
                
                if last_order_date and last_order_date < cutoff_date:
                    days_inactive = (datetime.now() - last_order_date).days
                    
                    inactive_customers.append({
                        "customer_id": customer.get("id"),
                        "name": f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip(),
                        "email": customer.get("email", ""),
                        "phone": customer.get("phone", ""),
                        "last_order_date": last_order_date.isoformat(),
                        "days_inactive": days_inactive,
                        "total_orders": len(orders)
                    })
            
            return inactive_customers
            
        except Exception as e:
            print(f"Error finding inactive customers: {e}")
            return []
    
    async def segment_and_reengage(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Segment inactive customers and send re-engagement messages"""
        try:
            inactive_customers = await self.find_inactive_customers(days=30)
            
            segments = {
                "reminder": [],      # 30-60 days
                "discount": [],      # 60-90 days
                "strong_offer": []   # 90+ days
            }
            
            results = {
                "total_inactive": len(inactive_customers),
                "emails_sent": 0,
                "whatsapp_sent": 0,
                "segment_breakdown": {}
            }
            
            for customer in inactive_customers:
                days = customer.get("days_inactive", 0)
                
                if days >= 90:
                    segments["strong_offer"].append(customer)
                    discount = "25%"
                elif days >= 60:
                    segments["discount"].append(customer)
                    discount = "20%"
                else:
                    segments["reminder"].append(customer)
                    discount = "15%"
                
                # Send email
                if customer.get("email"):
                    email_sent = self.gmail.send_reengagement_email(
                        to=customer["email"],
                        customer_name=customer["name"],
                        days_inactive=days,
                        discount_code=f"COMEBACK{discount.replace('%', '')}"
                    )
                    if email_sent:
                        results["emails_sent"] += 1
                
                # Send WhatsApp
                if customer.get("phone"):
                    message = f"Hi {customer['name']}! We miss you at our store. Here's {discount} off your next order with code COMEBACK{discount.replace('%', '')}"
                    whatsapp_sent = self.whatsapp.send_text_message(
                        to=customer["phone"],
                        message=message
                    )
                    if whatsapp_sent:
                        results["whatsapp_sent"] += 1
                
                # Log activity
                self.sheets.log_customer_activity(user_config.get("sheets_id"), {
                    "customer_id": customer["customer_id"],
                    "customer_name": customer["name"],
                    "customer_email": customer["email"],
                    "last_order_date": customer["last_order_date"],
                    "days_inactive": days,
                    "action_taken": f"Re-engagement ({discount} off)"
                })
            
            results["segment_breakdown"] = {
                k: len(v) for k, v in segments.items()
            }
            results["timestamp"] = datetime.now().isoformat()
            
            return results
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def run_weekly_reengagement(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run weekly re-engagement (scheduled on Sundays)"""
        return await self.segment_and_reengage(user_config)
