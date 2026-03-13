"""
Shopify Webhook Handler
Handles order/create, orders/fulfilled, and other Shopify webhooks
"""

import hmac
import hashlib
from typing import Dict, Any
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from automations.order_automation import OrderAutomation

class ShopifyWebhookHandler:
    """Handler for Shopify webhooks"""
    
    def __init__(self, order_automation: OrderAutomation, webhook_secret: str = ""):
        self.order_automation = order_automation
        self.webhook_secret = webhook_secret
    
    def verify_signature(self, payload: bytes, signature: str) -> bool:
        """Verify Shopify webhook signature"""
        if not self.webhook_secret:
            # Skip verification if no secret configured (dev mode)
            return True
        
        expected_signature = hmac.new(
            self.webhook_secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(f"sha256={expected_signature}", signature)
    
    async def handle_order_created(self, data: Dict[str, Any], user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Handle orders/create webhook"""
        try:
            order_id = str(data.get("id", ""))
            
            print(f"[WEBHOOK] Order created: {order_id}")
            
            # Process order through automation
            result = await self.order_automation.process_new_order(order_id, user_config)
            
            return {
                "status": "success",
                "event": "order_created",
                "order_id": order_id,
                "result": result
            }
            
        except Exception as e:
            return {
                "status": "error",
                "event": "order_created",
                "error": str(e)
            }
    
    async def handle_order_fulfilled(self, data: Dict[str, Any], user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Handle orders/fulfilled webhook"""
        try:
            order_id = str(data.get("id", ""))
            fulfillments = data.get("fulfillments", [])
            
            print(f"[WEBHOOK] Order fulfilled: {order_id}")
            
            if fulfillments:
                tracking_number = fulfillments[0].get("tracking_number", "")
                tracking_company = fulfillments[0].get("tracking_company", "")
                
                # Send shipping update
                result = await self.order_automation.process_shipping_update(
                    order_id, tracking_number, tracking_company, user_config
                )
                
                return {
                    "status": "success",
                    "event": "order_fulfilled",
                    "order_id": order_id,
                    "tracking_number": tracking_number,
                    "result": result
                }
            
            return {
                "status": "success",
                "event": "order_fulfilled",
                "order_id": order_id,
                "message": "No tracking information available"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "event": "order_fulfilled",
                "error": str(e)
            }
    
    async def handle_order_delivered(self, data: Dict[str, Any], user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Handle delivery confirmation (from Shiprocket/Delhivery webhooks)"""
        try:
            order_id = str(data.get("order_id", ""))
            
            print(f"[WEBHOOK] Order delivered: {order_id}")
            
            # Request review after delivery
            result = await self.order_automation.request_review(order_id, user_config)
            
            return {
                "status": "success",
                "event": "order_delivered",
                "order_id": order_id,
                "result": result
            }
            
        except Exception as e:
            return {
                "status": "error",
                "event": "order_delivered",
                "error": str(e)
            }
    
    async def handle_inventory_update(self, data: Dict[str, Any], user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Handle inventory level update webhook"""
        try:
            variant_id = data.get("inventory_item_id", "")
            available = data.get("available", 0)
            
            print(f"[WEBHOOK] Inventory updated: {variant_id} = {available}")
            
            # Could trigger low stock alerts here if needed
            
            return {
                "status": "success",
                "event": "inventory_update",
                "variant_id": variant_id,
                "available": available
            }
            
        except Exception as e:
            return {
                "status": "error",
                "event": "inventory_update",
                "error": str(e)
            }
    
    async def process_webhook(self, topic: str, data: Dict[str, Any], 
                             user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook based on topic"""
        
        handlers = {
            "orders/create": self.handle_order_created,
            "orders/fulfilled": self.handle_order_fulfilled,
            "orders/delivered": self.handle_order_delivered,
            "inventory_levels/update": self.handle_inventory_update,
        }
        
        handler = handlers.get(topic)
        if handler:
            return await handler(data, user_config)
        
        return {
            "status": "ignored",
            "event": topic,
            "message": "No handler for this event type"
        }
