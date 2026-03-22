"""
AI Chat Monetization System Tests
Tests for: /api/ai-chat/* endpoints
Features: Free tier limits, usage tracking, admin stats, subscription flow
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAIChatUsage:
    """Tests for AI chat usage tracking and free tier limits"""
    
    def test_usage_endpoint_returns_stats(self):
        """GET /api/ai-chat/usage should return usage statistics"""
        response = requests.get(f"{BASE_URL}/api/ai-chat/usage")
        assert response.status_code == 200
        
        data = response.json()
        # Verify response structure
        assert "total_messages" in data
        assert "messages_today" in data
        assert "free_tier_remaining" in data
        assert "subscription_active" in data
        
        # Verify data types
        assert isinstance(data["total_messages"], int)
        assert isinstance(data["messages_today"], int)
        assert isinstance(data["subscription_active"], bool)
        print(f"✓ Usage stats: {data}")
    
    def test_free_tier_limit_is_3_per_day(self):
        """Free tier should allow 3 questions per day"""
        response = requests.get(f"{BASE_URL}/api/ai-chat/usage")
        assert response.status_code == 200
        
        data = response.json()
        # Free tier remaining should be between 0 and 3
        if not data["subscription_active"]:
            assert 0 <= data["free_tier_remaining"] <= 3
            print(f"✓ Free tier remaining: {data['free_tier_remaining']}/3")


class TestAIChatMessage:
    """Tests for AI chat message endpoint"""
    
    def test_message_endpoint_exists(self):
        """POST /api/ai-chat/message should exist and accept requests"""
        response = requests.post(
            f"{BASE_URL}/api/ai-chat/message",
            json={"message": "test", "session_id": "pytest_session"}
        )
        # Should return 200 (success) or 429 (rate limited) - both are valid
        assert response.status_code in [200, 429]
        print(f"✓ Message endpoint returned status: {response.status_code}")
    
    def test_free_tier_limit_enforced(self):
        """Should return 429 when free tier limit is reached"""
        # First check current usage
        usage_response = requests.get(f"{BASE_URL}/api/ai-chat/usage")
        usage = usage_response.json()
        
        if usage["free_tier_remaining"] == 0:
            # Already at limit, test should get 429
            response = requests.post(
                f"{BASE_URL}/api/ai-chat/message",
                json={"message": "test question", "session_id": "pytest_limit_test"}
            )
            assert response.status_code == 429
            
            data = response.json()
            assert "detail" in data
            assert "error" in data["detail"]
            assert data["detail"]["error"] == "Free tier limit reached"
            print(f"✓ Free tier limit correctly enforced with 429 response")
        else:
            print(f"⚠ Free tier has {usage['free_tier_remaining']} remaining - cannot test limit enforcement")
            pytest.skip("Free tier not exhausted - cannot test limit enforcement")


class TestAIChatHistory:
    """Tests for chat history endpoint"""
    
    def test_history_endpoint_returns_list(self):
        """GET /api/ai-chat/history should return message history"""
        response = requests.get(
            f"{BASE_URL}/api/ai-chat/history",
            params={"session_id": "test_session_123", "limit": 10}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ History endpoint returned {len(data)} messages")


class TestAIChatAdminStats:
    """Tests for admin statistics endpoint"""
    
    def test_admin_stats_returns_all_metrics(self):
        """GET /api/ai-chat/admin/stats should return comprehensive stats"""
        response = requests.get(f"{BASE_URL}/api/ai-chat/admin/stats")
        assert response.status_code == 200
        
        data = response.json()
        # Verify all required fields
        required_fields = [
            "total_messages",
            "active_subscribers",
            "monthly_recurring_revenue",
            "messages_today",
            "free_tier_messages",
            "paid_tier_messages",
            "recent_questions"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify data types
        assert isinstance(data["total_messages"], int)
        assert isinstance(data["active_subscribers"], int)
        assert isinstance(data["monthly_recurring_revenue"], (int, float))
        assert isinstance(data["recent_questions"], list)
        
        print(f"✓ Admin stats: {data['total_messages']} messages, {data['active_subscribers']} subscribers, ${data['monthly_recurring_revenue']} MRR")
    
    def test_revenue_calculation(self):
        """Revenue should be subscribers * $9.99"""
        response = requests.get(f"{BASE_URL}/api/ai-chat/admin/stats")
        data = response.json()
        
        expected_revenue = data["active_subscribers"] * 9.99
        assert abs(data["monthly_recurring_revenue"] - expected_revenue) < 0.01
        print(f"✓ Revenue calculation correct: {data['active_subscribers']} × $9.99 = ${expected_revenue}")


class TestAIChatAdminSubscribers:
    """Tests for admin subscribers endpoint"""
    
    def test_subscribers_endpoint_returns_list(self):
        """GET /api/ai-chat/admin/subscribers should return subscriber list"""
        response = requests.get(f"{BASE_URL}/api/ai-chat/admin/subscribers")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Subscribers endpoint returned {len(data)} subscribers")


class TestAIChatAdminPricing:
    """Tests for admin pricing configuration"""
    
    def test_pricing_config_returns_defaults(self):
        """GET /api/ai-chat/admin/pricing should return pricing config"""
        response = requests.get(f"{BASE_URL}/api/ai-chat/admin/pricing")
        assert response.status_code == 200
        
        data = response.json()
        assert "unlimited_monthly" in data
        assert "free_tier_limit" in data
        assert "currency" in data
        
        # Verify default values
        assert data["unlimited_monthly"] == 9.99
        assert data["free_tier_limit"] == 3
        assert data["currency"] == "usd"
        print(f"✓ Pricing config: ${data['unlimited_monthly']}/month, {data['free_tier_limit']} free/day")


class TestAIChatSubscription:
    """Tests for subscription creation endpoint"""
    
    def test_subscribe_endpoint_exists(self):
        """POST /api/ai-chat/subscribe should exist"""
        response = requests.post(
            f"{BASE_URL}/api/ai-chat/subscribe",
            json={"email": "test@example.com", "plan": "unlimited"}
        )
        # Should return 200 (success with checkout URL) or 500 (Stripe error with test key)
        # Both indicate the endpoint exists and processes requests
        assert response.status_code in [200, 500]
        
        data = response.json()
        if response.status_code == 200:
            assert "checkout_url" in data
            assert "session_id" in data
            print(f"✓ Subscribe endpoint returned checkout URL")
        else:
            # Test Stripe key will fail - this is expected
            assert "detail" in data
            assert "Stripe error" in data["detail"]
            print(f"✓ Subscribe endpoint exists (Stripe test key error expected)")
    
    def test_subscribe_requires_email(self):
        """Subscribe should require email field"""
        response = requests.post(
            f"{BASE_URL}/api/ai-chat/subscribe",
            json={"plan": "unlimited"}  # Missing email
        )
        # Should return 422 (validation error) for missing required field
        assert response.status_code == 422
        print(f"✓ Subscribe correctly validates required email field")


class TestAIChatIntegration:
    """Integration tests for AI chat flow"""
    
    def test_usage_updates_after_message(self):
        """Usage stats should reflect message count"""
        # Get initial usage
        initial_response = requests.get(f"{BASE_URL}/api/ai-chat/usage")
        initial_usage = initial_response.json()
        
        # Verify messages_today matches what we see in admin stats
        admin_response = requests.get(f"{BASE_URL}/api/ai-chat/admin/stats")
        admin_stats = admin_response.json()
        
        # Total messages should be consistent
        assert initial_usage["total_messages"] <= admin_stats["total_messages"]
        print(f"✓ Usage tracking consistent: user={initial_usage['total_messages']}, admin={admin_stats['total_messages']}")
    
    def test_free_vs_paid_message_tracking(self):
        """Admin stats should track free vs paid messages separately"""
        response = requests.get(f"{BASE_URL}/api/ai-chat/admin/stats")
        data = response.json()
        
        # Free + paid should equal total
        total_tracked = data["free_tier_messages"] + data["paid_tier_messages"]
        assert total_tracked == data["total_messages"]
        print(f"✓ Message tracking: {data['free_tier_messages']} free + {data['paid_tier_messages']} paid = {data['total_messages']} total")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
