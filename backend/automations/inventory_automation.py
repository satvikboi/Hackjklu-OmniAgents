"""
Automation #2: Inventory Management Automation
Monitors stock levels and sends alerts/reorders
"""

from typing import Dict, Any, List
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.shopify_client import ShopifyClient
from mcp.whatsapp_client import WhatsAppClient
from mcp.gmail_client import GmailClient
from mcp.sheets_client import GoogleSheetsClient
from agents.analyst_agent import AnalystAgent

class InventoryAutomation:
    """Automates inventory management"""
    
    def __init__(self, shopify: ShopifyClient, whatsapp: WhatsAppClient,
                 gmail: GmailClient, sheets: GoogleSheetsClient,
                 analyst: AnalystAgent):
        self.shopify = shopify
        self.whatsapp = whatsapp
        self.gmail = gmail
        self.sheets = sheets
        self.analyst = analyst
        
    async def check_inventory(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check inventory levels and take action"""
        try:
            # Get inventory from Shopify
            inventory = self.shopify.get_inventory()
            
            low_stock_items = []
            out_of_stock_items = []
            reorder_items = []
            
            owner_phone = user_config.get("owner_phone", "")
            supplier_email = user_config.get("supplier_email", "")
            
            for item in inventory:
                quantity = item.get("inventory_quantity", 0)
                product_name = item.get("title", "")
                
                # Log to sheets
                self.sheets.log_inventory(user_config.get("sheets_id"), {
                    "product_id": item.get("product_id"),
                    "product_name": product_name,
                    "sku": item.get("sku"),
                    "quantity": quantity,
                    "threshold": 10
                })
                
                if quantity == 0:
                    out_of_stock_items.append(item)
                    # Mark out of stock on Shopify
                    self.shopify.update_inventory(item.get("variant_id"), 0)
                    
                    # Send urgent alert
                    if owner_phone:
                        self.whatsapp.send_low_stock_alert(
                            to=owner_phone,
                            product_name=product_name,
                            current_stock=0
                        )
                
                elif quantity <= 3:
                    reorder_items.append(item)
                    
                elif quantity <= 8:
                    low_stock_items.append(item)
                    # Send low stock alert
                    if owner_phone:
                        self.whatsapp.send_low_stock_alert(
                            to=owner_phone,
                            product_name=product_name,
                            current_stock=quantity
                        )
            
            # Send reorder email if needed
            reorder_sent = False
            if reorder_items and supplier_email:
                items_to_reorder = [
                    {"name": item.get("title"), "quantity": 50}  # Default reorder qty
                    for item in reorder_items
                ]
                reorder_sent = self.gmail.send_supplier_reorder(
                    to=supplier_email,
                    supplier_name=user_config.get("supplier_name", "Supplier"),
                    items=items_to_reorder
                )
            
            return {
                "status": "success",
                "total_products": len(inventory),
                "low_stock_count": len(low_stock_items),
                "out_of_stock_count": len(out_of_stock_items),
                "reorder_count": len(reorder_items),
                "reorder_email_sent": reorder_sent,
                "low_stock_items": [
                    {"name": i.get("title"), "quantity": i.get("inventory_quantity")}
                    for i in low_stock_items
                ],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def run_daily_check(self, user_config: Dict[str, Any]) -> Dict[str, Any]:
        """Run daily inventory check (scheduled at 6 AM)"""
        return await self.check_inventory(user_config)
