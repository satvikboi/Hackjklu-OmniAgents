"""
Google Sheets API Client - Data Tracking & Reporting
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime

class GoogleSheetsClient:
    """Client for Google Sheets API"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_SHEETS_API_KEY", "")
        self.credentials_path = os.getenv("GOOGLE_CREDENTIALS_PATH", "")
        
    def append_row(self, spreadsheet_id: str, range_name: str, 
                   values: List[Any]) -> bool:
        """Append a row to a spreadsheet"""
        try:
            print(f"[SHEETS] Appending to {spreadsheet_id}:{range_name}")
            print(f"[SHEETS] Values: {values}")
            return True
        except Exception as e:
            print(f"Sheets append_row error: {e}")
            return False
    
    def read_range(self, spreadsheet_id: str, range_name: str) -> List[List[Any]]:
        """Read data from a range"""
        try:
            print(f"[SHEETS] Reading {spreadsheet_id}:{range_name}")
            return []
        except Exception as e:
            print(f"Sheets read_range error: {e}")
            return []
    
    def update_cell(self, spreadsheet_id: str, cell: str, value: Any) -> bool:
        """Update a single cell"""
        try:
            print(f"[SHEETS] Updating {spreadsheet_id}:{cell} = {value}")
            return True
        except Exception as e:
            print(f"Sheets update_cell error: {e}")
            return False
    
    def log_order(self, spreadsheet_id: str, order_data: Dict[str, Any]) -> bool:
        """Log order to spreadsheet"""
        row = [
            datetime.now().isoformat(),
            order_data.get("order_id", ""),
            order_data.get("customer_name", ""),
            order_data.get("customer_email", ""),
            order_data.get("total", 0),
            order_data.get("status", ""),
            order_data.get("items_count", 0)
        ]
        return self.append_row(spreadsheet_id, "Orders!A:G", row)
    
    def log_inventory(self, spreadsheet_id: str, inventory_data: Dict[str, Any]) -> bool:
        """Log inventory snapshot"""
        row = [
            datetime.now().isoformat(),
            inventory_data.get("product_id", ""),
            inventory_data.get("product_name", ""),
            inventory_data.get("sku", ""),
            inventory_data.get("quantity", 0),
            inventory_data.get("threshold", 10)
        ]
        return self.append_row(spreadsheet_id, "Inventory!A:F", row)
    
    def log_customer_activity(self, spreadsheet_id: str, 
                              customer_data: Dict[str, Any]) -> bool:
        """Log customer activity for re-engagement tracking"""
        row = [
            datetime.now().isoformat(),
            customer_data.get("customer_id", ""),
            customer_data.get("customer_name", ""),
            customer_data.get("customer_email", ""),
            customer_data.get("last_order_date", ""),
            customer_data.get("days_inactive", 0),
            customer_data.get("action_taken", "")
        ]
        return self.append_row(spreadsheet_id, "CustomerActivity!A:G", row)
    
    def get_weekly_report_data(self, spreadsheet_id: str, 
                               week_start: str) -> Dict[str, Any]:
        """Get weekly report data from sheets"""
        try:
            # Read orders for the week
            orders_range = f"Orders!A:G"
            orders = self.read_range(spreadsheet_id, orders_range)
            
            # Calculate metrics
            total_revenue = sum(float(row[4]) for row in orders if len(row) > 4)
            total_orders = len(orders)
            
            return {
                "total_revenue": total_revenue,
                "total_orders": total_orders,
                "average_order_value": total_revenue / total_orders if total_orders > 0 else 0
            }
        except Exception as e:
            print(f"Sheets get_weekly_report_data error: {e}")
            return {}
    
    def update_inventory_thresholds(self, spreadsheet_id: str, 
                                    thresholds: Dict[str, int]) -> bool:
        """Update inventory threshold values"""
        try:
            for product_id, threshold in thresholds.items():
                # Would find the row and update threshold column
                print(f"[SHEETS] Updated threshold for {product_id}: {threshold}")
            return True
        except Exception as e:
            print(f"Sheets update_inventory_thresholds error: {e}")
            return False
