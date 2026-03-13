"""
Gmail API Client - Email Communication
"""

import os
import base64
from email.mime.text import MIMEText
from typing import Dict, Any, List, Optional

class GmailClient:
    """Client for Gmail API operations"""
    
    def __init__(self):
        self.api_key = os.getenv("GMAIL_API_KEY", "")
        self.sender_email = os.getenv("GMAIL_SENDER_EMAIL", "")
        # In production, use OAuth2 credentials
        # For demo, using API key approach or service account
        
    def send_email(self, to: str, subject: str, body: str, 
                   html_body: Optional[str] = None) -> bool:
        """Send email via Gmail API"""
        try:
            # Create message
            if html_body:
                message = MIMEText(html_body, 'html')
            else:
                message = MIMEText(body, 'plain')
            
            message['to'] = to
            message['from'] = self.sender_email
            message['subject'] = subject
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # In production, this would use Gmail API
            # For demo, log the email
            print(f"[GMAIL] To: {to}")
            print(f"[GMAIL] Subject: {subject}")
            print(f"[GMAIL] Body: {body[:100]}...")
            
            return True
        except Exception as e:
            print(f"Gmail send_email error: {e}")
            return False
    
    def send_order_confirmation(self, to: str, customer_name: str, order_id: str,
                                amount: str, items: list, shipping_address: str) -> bool:
        """Send order confirmation email"""
        subject = f"Order Confirmation - #{order_id}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank you for your order, {customer_name}!</h2>
            <p>Your order has been confirmed and is being processed.</p>
            
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #{order_id}</p>
                <p><strong>Total Amount:</strong> ₹{amount}</p>
                
                <h4>Items:</h4>
                <ul>
                    {''.join([f'<li>{item}</li>' for item in items])}
                </ul>
                
                <h4>Shipping Address:</h4>
                <p>{shipping_address}</p>
            </div>
            
            <p>We'll send you another email when your order ships.</p>
            <p>Questions? Reply to this email or contact us on WhatsApp.</p>
        </body>
        </html>
        """
        
        return self.send_email(to, subject, "", html_body)
    
    def send_supplier_reorder(self, to: str, supplier_name: str, 
                              items: List[Dict[str, Any]]) -> bool:
        """Send reorder email to supplier"""
        subject = "Reorder Request - Urgent"
        
        items_html = ""
        for item in items:
            items_html += f"<tr><td>{item['name']}</td><td>{item['quantity']}</td></tr>"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Reorder Request</h2>
            <p>Dear {supplier_name},</p>
            <p>We need to reorder the following items:</p>
            
            <table style="border-collapse: collapse; width: 100%;">
                <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Quantity</th>
                </tr>
                {items_html}
            </table>
            
            <p>Please confirm availability and delivery timeline.</p>
            <p>Thank you!</p>
        </body>
        </html>
        """
        
        return self.send_email(to, subject, "", html_body)
    
    def send_reengagement_email(self, to: str, customer_name: str, 
                                days_inactive: int, discount_code: Optional[str] = None) -> bool:
        """Send re-engagement email to inactive customer"""
        if days_inactive >= 90:
            subject = "We miss you! Here's 25% off"
            discount = "25%"
        elif days_inactive >= 60:
            subject = "Come back! Here's 20% off"
            discount = "20%"
        else:
            subject = "We miss you at our store!"
            discount = "15%"
        
        code = discount_code or f"COMEBACK{discount.replace('%', '')}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; text-align: center;">
            <h1>We Miss You, {customer_name}! 💕</h1>
            <p>It's been {days_inactive} days since your last visit.</p>
            <p>We'd love to have you back!</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 30px; margin: 20px; border-radius: 10px;">
                <h2 style="margin: 0;">{discount} OFF</h2>
                <p style="font-size: 24px; margin: 10px 0;">Use code: <strong>{code}</strong></p>
            </div>
            
            <a href="https://shop.example.com" 
               style="background: #333; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
                Shop Now
            </a>
        </body>
        </html>
        """
        
        return self.send_email(to, subject, "", html_body)
    
    def send_weekly_report(self, to: str, report_data: Dict[str, Any]) -> bool:
        """Send weekly analytics report"""
        subject = f"Weekly Business Report - {report_data.get('week', 'This Week')}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>📊 Weekly Business Report</h1>
            
            <div style="display: flex; justify-content: space-between; margin: 20px 0;">
                <div style="background: #f0f0f0; padding: 20px; text-align: center; flex: 1; margin: 0 10px;">
                    <h3>Revenue</h3>
                    <p style="font-size: 24px; font-weight: bold;">₹{report_data.get('revenue', 0):,.2f}</p>
                </div>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; flex: 1; margin: 0 10px;">
                    <h3>Orders</h3>
                    <p style="font-size: 24px; font-weight: bold;">{report_data.get('orders', 0)}</p>
                </div>
            </div>
            
            <h3>🏆 Best Sellers</h3>
            <ol>
                {''.join([f"<li>{item['name']} - ₹{item['revenue']:,.2f}</li>" 
                         for item in report_data.get('best_sellers', [])[:5]])}
            </ol>
            
            <p style="margin-top: 30px; color: #666;">
                View detailed analytics in your OmniAgent dashboard.
            </p>
        </body>
        </html>
        """
        
        return self.send_email(to, subject, "", html_body)
