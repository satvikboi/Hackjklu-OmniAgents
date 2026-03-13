"""
Base Agent Class - All agents inherit from this
"""

import os
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

from groq import Groq

class BaseAgent(ABC):
    """Base class for all OmniAgent agents"""
    
    def __init__(self, name: str, role: str, model: str = "llama-3.1-70b-versatile"):
        self.name = name
        self.role = role
        self.model = model
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            self.client = Groq(api_key=api_key)
        else:
            self.client = None
        self.confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", 7.0))
        
    def get_system_prompt(self) -> str:
        """Get the system prompt for this agent - override in subclasses"""
        return f"You are {self.name}, {self.role}."
    
    async def run(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Run the agent with input data
        
        Args:
            input_data: Input from previous agent or user
            context: Additional context (business profile, etc.)
            
        Returns:
            Dictionary with output and metadata
        """
        try:
            # Check if client is available
            if not self.client:
                return {
                    "agent": self.name,
                    "output": f"[MOCK] {self.name} processed the request (GROQ_API_KEY not set)",
                    "confidence": 8.5,
                    "timestamp": datetime.now().isoformat(),
                    "success": True
                }
            
            # Build prompt
            system_prompt = self.get_system_prompt()
            user_prompt = self._build_user_prompt(input_data, context)
            
            # Call LLM
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            output = response.choices[0].message.content
            
            # Calculate confidence score
            confidence = await self._calculate_confidence(output, input_data)
            
            return {
                "agent": self.name,
                "output": output,
                "confidence": confidence,
                "timestamp": datetime.now().isoformat(),
                "success": True
            }
            
        except Exception as e:
            return {
                "agent": self.name,
                "output": f"Error: {str(e)}",
                "confidence": 0.0,
                "timestamp": datetime.now().isoformat(),
                "success": False,
                "error": str(e)
            }
    
    @abstractmethod
    def _build_user_prompt(self, input_data: Dict[str, Any], context: Dict[str, Any] = None) -> str:
        """Build the user prompt - must be implemented by subclasses"""
        pass
    
    async def _calculate_confidence(self, output: str, input_data: Dict[str, Any]) -> float:
        """
        Calculate confidence score for the output
        Override in subclasses for agent-specific scoring
        """
        # Default implementation - use LLM to score
        try:
            score_prompt = f"""
Rate the quality of this output on a scale of 1-10 based on:
1. Completeness (did it address all parts of the request?)
2. Accuracy (is the information correct and well-researched?)
3. Clarity (is it well-structured and easy to understand?)

Output to rate:
{output[:1000]}...

Respond with ONLY a number from 1.0 to 10.0
"""
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": score_prompt}],
                temperature=0.1,
                max_tokens=10
            )
            
            score_text = response.choices[0].message.content.strip()
            # Extract number from response
            import re
            numbers = re.findall(r'\d+\.?\d*', score_text)
            if numbers:
                score = float(numbers[0])
                return min(max(score, 1.0), 10.0)
            return 7.0
            
        except Exception:
            return 7.0  # Default confidence
    
    def format_business_context(self, context: Dict[str, Any]) -> str:
        """Format business profile context for prompts"""
        if not context or "business_profile" not in context:
            return ""
        
        bp = context["business_profile"]
        return f"""
BUSINESS CONTEXT:
- Name: {bp.get('business_name', 'Unknown')}
- Industry: {bp.get('industry', 'Unknown')}
- Monthly Revenue: ₹{bp.get('monthly_revenue', 'Unknown')}
- City: {bp.get('city', 'Unknown')}
- Goal: {bp.get('business_goal', 'Unknown')}
- Target Audience: {bp.get('target_audience', 'Unknown')}
"""
