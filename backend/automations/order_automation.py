"""
Automation #1: Order Management Automation
Handles order confirmations, shipping updates, and review requests
"""

from typing import Dict, Any, Optional
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.shopify_client import ShopifyClient
from mcp.whatsapp_client import WhatsAppClient
from mcp.gmail_client import GmailClient
from mcp.sheets_client import GoogleSheetsClient
from agents.writer_agent import WriterAgent
from agents.critic_agent import CriticAgent

class OrderAutomation:
    """Automates order management workflow"""
    
    def __init__(self, shopify: ShopifyClient, whatsapp: WhatsAppClient,
                 gmail: GmailClient, sheets: GoogleSheetsClient,
                 writer: WriterAgent, critic: CriticAgent):
        self.shopify = shopify
        self.whatsapp = whatsapp
        self.gmail = gmail
        self.sheets = sheets
        self.writer = writer
        self.critic = critic
        
    async def process_new_order(self, order_id: str, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Process a new order - confirmation + WhatsApp"""
        try:
            # Get order details
            order = self.shopify.get_order(order_id)
            if not order:
                return {"status": "error", "message": "Order not found"}
            
            customer = order.get("customer", {})
            customer_name = customer.get("first_name", "Customer")
            customer_email = customer.get("email", "")
            customer_phone = customer.get("phone", "")
            
            # Extract items
            items = [item.get("title", "") for item in order.get("line_items", [])]
            
            # Send email confirmation
            email_sent = self.gmail.send_order_confirmation(
                to=customer_email,
                customer_name=customer_name,
                order_id=order_id,
                amount=order.get("total_price", "0"),
                items=items,
                shipping_address=order.get("shipping_address", {}).get("address1", "")
            )
            
            # Send WhatsApp confirmation
            whatsapp_sent = False
            if customer_phone:
                whatsapp_sent = self.whatsapp.send_order_confirmation(
                    to=customer_phone,
                    customer_name=customer_name,
                    order_id=order_id,
                    amount=order.get("total_price", "0"),
                    items=items
                )
            
            # Log to sheets
            self.sheets.log_order(user_config.get("sheets_id"), {
                "order_id": order_id,
                "customer_name": f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip(),
                "customer_email": customer_email,
                "total": order.get("total_price", 0),
                "status": "confirmed",
                "items_count": len(items)
            })
            
            return {
                "status": "success",
                "order_id": order_id,
                "email_sent": email_sent,
                "whatsapp_sent": whatsapp_sent,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def process_shipping_update(self, order_id: str, tracking_number: str,
                                      courier: str, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Send shipping update to customer"""
        try:
            order = self.shopify.get_order(order_id)
            if not order:
                return {"status": "error", "message": "Order not found"}
            
            customer = order.get("customer", {})
            customer_name = customer.get("first_name", "Customer")
            customer_phone = customer.get("phone", "")
            
            # Send WhatsApp shipping update
            whatsapp_sent = False
            if customer_phone:
                whatsapp_sent = self.whatsapp.send_shipping_update(
                    to=customer_phone,
                    customer_name=customer_name,
                    order_id=order_id,
                    tracking_number=tracking_number,
                    courier=courier
                )
            
            return {
                "status": "success",
                "order_id": order_id,
                "tracking_number": tracking_number,
                "whatsapp_sent": whatsapp_sent,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def request_review(self, order_id: str, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Request review after delivery"""
        try:
            order = self.shopify.get_order(order_id)
            if not order:
                return {"status": "error", "message": "Order not found"}
            
            customer = order.get("customer", {})
            customer_name = customer.get("first_name", "Customer")
            customer_phone = customer.get("phone", "")
            customer_email = customer.get("email", "")
            
            # Send WhatsApp review request
            whatsapp_sent = False
            if customer_phone:
                whatsapp_sent = self.whatsapp.send_review_request(
                    to=customer_phone,
                    customer_name=customer_name,
                    order_id=order_id
                )
            
            return {
                "status": "success",
                "order_id": order_id,
                "whatsapp_sent": whatsapp_sent,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def run_full_workflow(self, order_id: str, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run complete order workflow"""
        results = {
            "order_id": order_id,
            "steps": []
        }
        
        # Step 1: Process new order
        confirmation = await self.process_new_order(order_id, user_config)
        results["steps"].append({"step": "confirmation", "result": confirmation})
        
        # Note: Shipping and review would typically be triggered by webhooks
        # from Shiprocket/Delhivery when status changes
        
        return results
