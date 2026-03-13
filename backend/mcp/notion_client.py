"""
Notion API Client - Reports & Content Calendar
"""

import os
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime

class NotionClient:
    """Client for Notion API"""
    
    def __init__(self):
        self.api_token = os.getenv("NOTION_API_TOKEN", "")
        self.base_url = "https://api.notion.com/v1"
        
    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
    
    def create_page(self, parent_database_id: str, 
                    properties: Dict[str, Any],
                    content: Optional[List[Dict]] = None) -> Optional[str]:
        """Create a new page in Notion"""
        try:
            url = f"{self.base_url}/pages"
            payload = {
                "parent": {"database_id": parent_database_id},
                "properties": properties
            }
            if content:
                payload["children"] = content
            
            response = requests.post(url, headers=self._headers(), json=payload)
            response.raise_for_status()
            return response.json().get("id")
        except Exception as e:
            print(f"Notion create_page error: {e}")
            return None
    
    def create_report(self, database_id: str, report_data: Dict[str, Any]) -> Optional[str]:
        """Create a weekly report page"""
        try:
            properties = {
                "Name": {"title": [{"text": {"content": report_data.get("title", "Weekly Report")}}]},
                "Week": {"date": {"start": report_data.get("week_start", datetime.now().isoformat())}},
                "Revenue": {"number": report_data.get("revenue", 0)},
                "Orders": {"number": report_data.get("orders", 0)},
                "Status": {"select": {"name": "Complete"}}
            }
            
            content = [
                {
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"type": "text", "text": {"content": "Executive Summary"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": report_data.get("summary", "")}}]
                    }
                },
                {
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"type": "text", "text": {"content": "Best Sellers"}}]
                    }
                }
            ]
            
            # Add best sellers as bullet points
            for item in report_data.get("best_sellers", []):
                content.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [{"type": "text", "text": {"content": item.get("name", "")}}]
                    }
                })
            
            return self.create_page(database_id, properties, content)
        except Exception as e:
            print(f"Notion create_report error: {e}")
            return None
    
    def create_content_calendar(self, database_id: str, 
                                content_items: List[Dict[str, Any]]) -> List[str]:
        """Create content calendar entries"""
        page_ids = []
        
        for item in content_items:
            try:
                properties = {
                    "Name": {"title": [{"text": {"content": item.get("title", "Untitled")}}]},
                    "Platform": {"select": {"name": item.get("platform", "Instagram")}},
                    "Status": {"select": {"name": "Scheduled"}},
                    "Scheduled Date": {"date": {"start": item.get("scheduled_time", datetime.now().isoformat())}}
                }
                
                content = [
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"type": "text", "text": {"content": item.get("caption", "")}}]
                        }
                    },
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"type": "text", "text": {"content": f"Hashtags: {', '.join(item.get('hashtags', []))}"}}]
                        }
                    }
                ]
                
                page_id = self.create_page(database_id, properties, content)
                if page_id:
                    page_ids.append(page_id)
            except Exception as e:
                print(f"Notion create_content_calendar item error: {e}")
        
        return page_ids
    
    def query_database(self, database_id: str, 
                       filter_params: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Query a Notion database"""
        try:
            url = f"{self.base_url}/databases/{database_id}/query"
            payload = filter_params or {}
            
            response = requests.post(url, headers=self._headers(), json=payload)
            response.raise_for_status()
            return response.json().get("results", [])
        except Exception as e:
            print(f"Notion query_database error: {e}")
            return []
    
    def update_page(self, page_id: str, properties: Dict[str, Any]) -> bool:
        """Update a page's properties"""
        try:
            url = f"{self.base_url}/pages/{page_id}"
            payload = {"properties": properties}
            
            response = requests.patch(url, headers=self._headers(), json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Notion update_page error: {e}")
            return False
    
    def create_ad_recommendations(self, database_id: str, 
                                   recommendations: List[Dict[str, Any]]) -> List[str]:
        """Store ad campaign recommendations"""
        page_ids = []
        
        for rec in recommendations:
            try:
                properties = {
                    "Name": {"title": [{"text": {"content": rec.get("title", "Ad Recommendation")}}]},
                    "Campaign": {"relation": [{"id": rec.get("campaign_id", "")}]},
                    "Priority": {"select": {"name": rec.get("priority", "Medium")}},
                    "Status": {"select": {"name": "Pending"}}
                }
                
                content = [
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"type": "text", "text": {"content": rec.get("description", "")}}]
                        }
                    },
                    {
                        "object": "block",
                        "type": "heading_3",
                        "heading_3": {
                            "rich_text": [{"type": "text", "text": {"content": "Suggested Actions"}}]
                        }
                    }
                ]
                
                # Add action items as bullet points
                for action in rec.get("actions", []):
                    content.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"type": "text", "text": {"content": action}}]
                        }
                    })
                
                page_id = self.create_page(database_id, properties, content)
                if page_id:
                    page_ids.append(page_id)
            except Exception as e:
                print(f"Notion create_ad_recommendations item error: {e}")
        
        return page_ids
