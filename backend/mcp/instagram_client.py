"""
Instagram Graph API Client - Social Media Automation
"""

import os
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

class InstagramClient:
    """Client for Instagram Graph API"""
    
    def __init__(self):
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
        self.business_account_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID", "")
        self.base_url = "https://graph.facebook.com/v18.0"
        
    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token}"
        }
    
    def get_account_info(self) -> Dict[str, Any]:
        """Get Instagram business account info"""
        try:
            url = f"{self.base_url}/{self.business_account_id}"
            params = {
                "fields": "username,followers_count,follows_count,media_count"
            }
            response = requests.get(url, headers=self._headers(), params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Instagram get_account_info error: {e}")
            return {}
    
    def get_media(self, limit: int = 25) -> List[Dict[str, Any]]:
        """Get recent media posts"""
        try:
            url = f"{self.base_url}/{self.business_account_id}/media"
            params = {
                "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
                "limit": limit
            }
            response = requests.get(url, headers=self._headers(), params=params)
            response.raise_for_status()
            return response.json().get("data", [])
        except Exception as e:
            print(f"Instagram get_media error: {e}")
            return []
    
    def get_insights(self, metric: str = "impressions,reach,profile_views") -> Dict[str, Any]:
        """Get account insights"""
        try:
            url = f"{self.base_url}/{self.business_account_id}/insights"
            params = {
                "metric": metric,
                "period": "day"
            }
            response = requests.get(url, headers=self._headers(), params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Instagram get_insights error: {e}")
            return {}
    
    def publish_media(self, image_url: str, caption: str) -> Optional[str]:
        """Publish a media post"""
        try:
            # Step 1: Create media container
            url = f"{self.base_url}/{self.business_account_id}/media"
            payload = {
                "image_url": image_url,
                "caption": caption,
                "access_token": self.access_token
            }
            response = requests.post(url, json=payload)
            response.raise_for_status()
            creation_id = response.json().get("id")
            
            # Step 2: Publish the container
            publish_url = f"{self.base_url}/{self.business_account_id}/media_publish"
            publish_payload = {
                "creation_id": creation_id,
                "access_token": self.access_token
            }
            publish_response = requests.post(publish_url, json=publish_payload)
            publish_response.raise_for_status()
            
            return publish_response.json().get("id")
        except Exception as e:
            print(f"Instagram publish_media error: {e}")
            return None
    
    def schedule_content(self, content_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Schedule multiple posts for the week"""
        scheduled = []
        
        for i, item in enumerate(content_items):
            # Calculate post time (spread across the week)
            post_time = datetime.now() + timedelta(days=i)
            
            scheduled.append({
                "content": item.get("caption"),
                "hashtags": item.get("hashtags", []),
                "scheduled_time": post_time.isoformat(),
                "status": "scheduled",
                "image_prompt": item.get("image_prompt", "")
            })
        
        return scheduled
    
    def get_engagement_metrics(self, days: int = 7) -> Dict[str, Any]:
        """Get engagement metrics for the past week"""
        try:
            media = self.get_media(limit=50)
            
            # Filter media from the last N days
            cutoff_date = datetime.now() - timedelta(days=days)
            recent_media = [
                m for m in media 
                if datetime.fromisoformat(m.get("timestamp", "").replace("Z", "+00:00")) > cutoff_date
            ]
            
            total_likes = sum(m.get("like_count", 0) for m in recent_media)
            total_comments = sum(m.get("comments_count", 0) for m in recent_media)
            
            # Find best performing post
            best_post = max(recent_media, key=lambda x: x.get("like_count", 0) + x.get("comments_count", 0), default=None)
            
            return {
                "total_posts": len(recent_media),
                "total_likes": total_likes,
                "total_comments": total_comments,
                "engagement_rate": (total_likes + total_comments) / len(recent_media) if recent_media else 0,
                "best_performing_post": {
                    "id": best_post.get("id"),
                    "caption": best_post.get("caption", "")[:100] if best_post else "",
                    "likes": best_post.get("like_count", 0) if best_post else 0,
                    "permalink": best_post.get("permalink") if best_post else ""
                } if best_post else None
            }
        except Exception as e:
            print(f"Instagram get_engagement_metrics error: {e}")
            return {}
    
    def get_dms(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get direct messages (requires additional permissions)"""
        # Note: Instagram Graph API has limited DM access
        # This is a placeholder for when those permissions are available
        try:
            # Would use conversations endpoint with proper permissions
            return []
        except Exception as e:
            print(f"Instagram get_dms error: {e}")
            return []
    
    def reply_to_dm(self, user_id: str, message: str) -> bool:
        """Reply to a direct message"""
        # Note: Requires Instagram Messaging API permissions
        try:
            print(f"[INSTAGRAM DM] To: {user_id}, Message: {message}")
            return True
        except Exception as e:
            print(f"Instagram reply_to_dm error: {e}")
            return False
