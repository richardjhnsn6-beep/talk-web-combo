"""
Backend API Tests for Biblical Scholar Website
Tests: Payment endpoints, Analytics endpoints, Page view tracking
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic health check tests"""
    
    def test_root_endpoint(self):
        """Test root API endpoint returns Hello World"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Hello World"
        print("✅ Root endpoint working")


class TestAnalyticsEndpoints:
    """Analytics API endpoint tests"""
    
    def test_dashboard_endpoint(self):
        """Test analytics dashboard returns proper structure"""
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        # Verify payments structure
        assert "payments" in data
        assert "total_revenue" in data["payments"]
        assert "successful_payments" in data["payments"]
        assert "total_transactions" in data["payments"]
        assert "recent_transactions" in data["payments"]
        
        # Verify page_views structure
        assert "page_views" in data
        assert "total_views" in data["page_views"]
        assert "by_page" in data["page_views"]
        
        print(f"✅ Dashboard endpoint working - Revenue: ${data['payments']['total_revenue']}, Views: {data['page_views']['total_views']}")
    
    def test_pageview_tracking(self):
        """Test page view tracking endpoint"""
        payload = {
            "page": "TEST_Book of Amos",
            "visitor_id": "TEST_visitor_123",
            "user_agent": "pytest-test-agent"
        }
        response = requests.post(
            f"{BASE_URL}/api/analytics/pageview",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "tracked"
        print("✅ Page view tracking working")
    
    def test_transactions_endpoint(self):
        """Test transactions list endpoint"""
        response = requests.get(f"{BASE_URL}/api/analytics/transactions")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Transactions endpoint working - {len(data)} transactions found")


class TestPaymentEndpoints:
    """Payment API endpoint tests"""
    
    def test_checkout_session_creation(self):
        """Test Stripe checkout session creation"""
        payload = {
            "package_id": "chapter1_unlock",
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "metadata": {
                "content": "Book of Amos - Chapter 1 Full",
                "verses": "6-15",
                "test": "true"
            }
        }
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/checkout/session",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert data["url"].startswith("https://")
        assert "checkout.stripe.com" in data["url"] or "integrations.emergentagent.com" in data["url"]
        
        print(f"✅ Checkout session created - Session ID: {data['session_id'][:30]}...")
        return data["session_id"]
    
    def test_checkout_session_invalid_package(self):
        """Test checkout with invalid package returns 400"""
        payload = {
            "package_id": "invalid_package",
            "origin_url": "https://example.com",
            "metadata": {}
        }
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/checkout/session",
            json=payload
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print("✅ Invalid package correctly rejected with 400")
    
    def test_checkout_status_endpoint(self):
        """Test checkout status endpoint with a session ID"""
        # First create a session
        payload = {
            "package_id": "chapter1_unlock",
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "metadata": {"test": "true"}
        }
        create_response = requests.post(
            f"{BASE_URL}/api/payments/v1/checkout/session",
            json=payload
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Now check status
        status_response = requests.get(
            f"{BASE_URL}/api/payments/v1/checkout/status/{session_id}"
        )
        assert status_response.status_code == 200
        
        data = status_response.json()
        assert "session_id" in data
        assert "status" in data
        assert "payment_status" in data
        assert data["session_id"] == session_id
        
        print(f"✅ Checkout status endpoint working - Status: {data['payment_status']}")


class TestPaymentPersistence:
    """Test that payments are properly stored in MongoDB"""
    
    def test_transaction_stored_after_checkout(self):
        """Verify transaction is stored in database after checkout creation"""
        # Create a checkout session
        payload = {
            "package_id": "chapter1_unlock",
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "metadata": {"test": "persistence_test"}
        }
        create_response = requests.post(
            f"{BASE_URL}/api/payments/v1/checkout/session",
            json=payload
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Verify it appears in transactions
        transactions_response = requests.get(f"{BASE_URL}/api/analytics/transactions")
        assert transactions_response.status_code == 200
        
        transactions = transactions_response.json()
        session_ids = [t.get("session_id") for t in transactions]
        assert session_id in session_ids, "Transaction not found in database"
        
        # Find the transaction and verify data
        transaction = next(t for t in transactions if t.get("session_id") == session_id)
        assert transaction["amount"] == 4.99
        assert transaction["package_id"] == "chapter1_unlock"
        assert transaction["payment_status"] == "pending"
        
        print(f"✅ Transaction correctly stored in MongoDB - Amount: ${transaction['amount']}")


class TestDashboardRealTimeData:
    """Test dashboard reflects real-time data"""
    
    def test_dashboard_shows_transactions(self):
        """Verify dashboard shows transaction count"""
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        # Should have at least 1 transaction from previous tests
        assert data["payments"]["total_transactions"] >= 1
        print(f"✅ Dashboard shows {data['payments']['total_transactions']} total transactions")
    
    def test_dashboard_shows_page_views(self):
        """Verify dashboard shows page view count"""
        # First track a page view
        requests.post(
            f"{BASE_URL}/api/analytics/pageview",
            json={"page": "TEST_Dashboard Test", "visitor_id": "test_visitor"}
        )
        
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert data["page_views"]["total_views"] >= 1
        print(f"✅ Dashboard shows {data['page_views']['total_views']} total page views")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
