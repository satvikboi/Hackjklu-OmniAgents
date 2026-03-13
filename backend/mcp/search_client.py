"""
Brave Search API Client - Research & Competitor Analysis
"""

import os
import requests
from typing import Dict, Any, List, Optional

class BraveSearchClient:
    """Client for Brave Search API"""
    
    def __init__(self):
        self.api_key = os.getenv("BRAVE_API_KEY", "")
        self.base_url = "https://api.search.brave.com/res/v1"
        
    def _headers(self) -> Dict[str, str]:
        return {
            "X-Subscription-Token": self.api_key,
            "Accept": "application/json"
        }
    
    def search(self, query: str, count: int = 10) -> List[Dict[str, Any]]:
        """Perform web search"""
        try:
            url = f"{self.base_url}/web/search"
            params = {
                "q": query,
                "count": count
            }
            response = requests.get(url, headers=self._headers(), params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("web", {}).get("results", [])
        except Exception as e:
            print(f"Brave search error: {e}")
            return []
    
    def search_news(self, query: str, count: int = 10) -> List[Dict[str, Any]]:
        """Search for news articles"""
        try:
            url = f"{self.base_url}/news/search"
            params = {
                "q": query,
                "count": count
            }
            response = requests.get(url, headers=self._headers(), params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            print(f"Brave search_news error: {e}")
            return []
    
    def research_competitor(self, competitor_name: str, industry: str) -> Dict[str, Any]:
        """Research a competitor"""
        try:
            # Search for competitor information
            query = f"{competitor_name} {industry} India pricing strategy marketing"
            results = self.search(query, count=20)
            
            # Extract insights
            insights = {
                "name": competitor_name,
                "industry": industry,
                "sources": [],
                "mentions": len(results),
                "key_findings": []
            }
            
            for result in results[:5]:
                insights["sources"].append({
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "description": result.get("description", "")[:200]
                })
            
            return insights
        except Exception as e:
            print(f"Brave research_competitor error: {e}")
            return {"name": competitor_name, "error": str(e)}
    
    def find_trending_hashtags(self, industry: str, location: str = "India") -> List[str]:
        """Find trending hashtags for an industry"""
        try:
            query = f"trending hashtags {industry} {location} 2024"
            results = self.search(query, count=10)
            
            # Extract hashtags from results
            hashtags = []
            for result in results:
                desc = result.get("description", "")
                # Simple hashtag extraction
                words = desc.split()
                for word in words:
                    if word.startswith("#") and len(word) > 1:
                        hashtags.append(word.strip(".,!?:;"))
            
            # Return unique hashtags
            return list(set(hashtags))[:15]
        except Exception as e:
            print(f"Brave find_trending_hashtags error: {e}")
            return []
    
    def research_market_trends(self, industry: str, location: str = "India") -> Dict[str, Any]:
        """Research market trends"""
        try:
            # Search for market trends
            trend_query = f"{industry} market trends {location} 2024"
            trend_results = self.search(trend_query, count=10)
            
            # Search for news
            news_query = f"{industry} industry news {location}"
            news_results = self.search_news(news_query, count=5)
            
            return {
                "industry": industry,
                "location": location,
                "trend_sources": [
                    {"title": r.get("title"), "url": r.get("url")}
                    for r in trend_results[:5]
                ],
                "recent_news": [
                    {"title": r.get("title"), "url": r.get("url")}
                    for r in news_results[:3]
                ]
            }
        except Exception as e:
            print(f"Brave research_market_trends error: {e}")
            return {}
    
    def find_content_ideas(self, industry: str, target_audience: str) -> List[Dict[str, Any]]:
        """Find content ideas based on trending topics"""
        try:
            query = f"{industry} content ideas {target_audience} trending topics"
            results = self.search(query, count=15)
            
            ideas = []
            for result in results[:10]:
                ideas.append({
                    "title": result.get("title", ""),
                    "source": result.get("url", ""),
                    "snippet": result.get("description", "")[:150]
                })
            
            return ideas
        except Exception as e:
            print(f"Brave find_content_ideas error: {e}")
            return []
