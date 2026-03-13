"""
Shopify API Client - Order Management, Inventory, Customers
"""

import os
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime

class ShopifyClient:
    """Client for Shopify API operations"""
    
    def __init__(self):
        self.shop_domain = os.getenv("SHOPIFY_SHOP_DOMAIN", "")
        self.access_token = os.getenv("SHOPIFY_ACCESS_TOKEN", "")
        self.api_version = "2024-01"
        self.base_url = f"https://{self.shop_domain}/admin/api/{self.api_version}"
        
    def _headers(self) -> Dict[str, str]:
        return {
            "X-Shopify-Access-Token": self.access_token,
            "Content-Type": "application/json"
        }
    
    def get_orders(self, status: str = "any", limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch orders from Shopify"""
        try:
            url = f"{self.base_url}/orders.json?status={status}&limit={limit}"
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            return response.json().get("orders", [])
        except Exception as e:
            print(f"Shopify get_orders error: {e}")
            return []
    
    def get_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Get specific order details"""
        try:
            url = f"{self.base_url}/orders/{order_id}.json"
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            return response.json().get("order")
        except Exception as e:
            print(f"Shopify get_order error: {e}")
            return None
    
    def update_order(self, order_id: str, data: Dict[str, Any]) -> bool:
        """Update order details"""
        try:
            url = f"{self.base_url}/orders/{order_id}.json"
            response = requests.put(url, headers=self._headers(), json={"order": data})
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Shopify update_order error: {e}")
            return False
    
    def get_inventory(self, product_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch inventory levels"""
        try:
            if product_id:
                url = f"{self.base_url}/products/{product_id}.json"
                response = requests.get(url, headers=self._headers())
                response.raise_for_status()
                product = response.json().get("product", {})
                return product.get("variants", [])
            else:
                url = f"{self.base_url}/products.json?limit=250"
                response = requests.get(url, headers=self._headers())
                response.raise_for_status()
                products = response.json().get("products", [])
                inventory = []
                for product in products:
                    for variant in product.get("variants", []):
                        inventory.append({
                            "product_id": product["id"],
                            "variant_id": variant["id"],
                            "title": product["title"],
                            "variant_title": variant["title"],
                            "sku": variant["sku"],
                            "inventory_quantity": variant["inventory_quantity"],
                            "price": variant["price"]
                        })
                return inventory
        except Exception as e:
            print(f"Shopify get_inventory error: {e}")
            return []
    
    def update_inventory(self, variant_id: str, quantity: int) -> bool:
        """Update inventory quantity"""
        try:
            url = f"{self.base_url}/variants/{variant_id}.json"
            data = {"variant": {"id": variant_id, "inventory_quantity": quantity}}
            response = requests.put(url, headers=self._headers(), json=data)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Shopify update_inventory error: {e}")
            return False
    
    def get_customers(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch customers"""
        try:
            url = f"{self.base_url}/customers.json?limit={limit}"
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            return response.json().get("customers", [])
        except Exception as e:
            print(f"Shopify get_customers error: {e}")
            return []
    
    def get_customer_orders(self, customer_id: str) -> List[Dict[str, Any]]:
        """Get order history for a customer"""
        try:
            url = f"{self.base_url}/customers/{customer_id}/orders.json"
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            return response.json().get("orders", [])
        except Exception as e:
            print(f"Shopify get_customer_orders error: {e}")
            return []
    
    def get_analytics(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Get sales analytics"""
        try:
            # Get orders in date range
            url = f"{self.base_url}/orders.json?created_at_min={start_date}&created_at_max={end_date}&status=any&limit=250"
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            orders = response.json().get("orders", [])
            
            # Calculate metrics
            total_revenue = sum(float(order.get("total_price", 0)) for order in orders)
            total_orders = len(orders)
            
            # Product performance
            product_sales = {}
            for order in orders:
                for item in order.get("line_items", []):
                    product_id = item.get("product_id")
                    if product_id:
                        if product_id not in product_sales:
                            product_sales[product_id] = {
                                "name": item.get("name"),
                                "quantity": 0,
                                "revenue": 0
                            }
                        product_sales[product_id]["quantity"] += item.get("quantity", 0)
                        product_sales[product_id]["revenue"] += float(item.get("price", 0)) * item.get("quantity", 0)
            
            # Sort by revenue
            best_sellers = sorted(product_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)[:10]
            
            return {
                "total_revenue": total_revenue,
                "total_orders": total_orders,
                "average_order_value": total_revenue / total_orders if total_orders > 0 else 0,
                "best_sellers": [{"product_id": k, **v} for k, v in best_sellers]
            }
        except Exception as e:
            print(f"Shopify get_analytics error: {e}")
            return {}
