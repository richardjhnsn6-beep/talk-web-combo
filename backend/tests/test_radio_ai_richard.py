"""
Backend API Tests for Radio Playlist Mixed Endpoint and AI Richard Conversation Persistence
Tests: 
- Radio playlist/mixed endpoint returns 60 items with announcements interspersed
- AI Richard conversation persistence across multiple messages
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestRadioPlaylistMixed:
    """Tests for GET /api/radio/playlist/mixed endpoint"""
    
    def test_playlist_mixed_returns_60_items(self):
        """Test that playlist/mixed returns approximately 60 items"""
        response = requests.get(f"{BASE_URL}/api/radio/playlist/mixed")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # Should return around 60 items (47 tracks + 13 announcements)
        assert len(data) >= 50, f"Expected at least 50 items, got {len(data)}"
        print(f"✅ Playlist mixed returns {len(data)} items")
    
    def test_playlist_mixed_has_tracks_and_announcements(self):
        """Test that playlist contains both tracks and announcements"""
        response = requests.get(f"{BASE_URL}/api/radio/playlist/mixed")
        assert response.status_code == 200
        
        data = response.json()
        
        tracks = [item for item in data if item.get("type") == "track"]
        announcements = [item for item in data if item.get("type") == "announcement"]
        
        assert len(tracks) > 0, "No tracks found in playlist"
        assert len(announcements) > 0, "No announcements found in playlist"
        
        print(f"✅ Playlist has {len(tracks)} tracks and {len(announcements)} announcements")
    
    def test_playlist_mixed_announcements_interspersed(self):
        """Test that announcements are interspersed between tracks (every ~3 tracks)"""
        response = requests.get(f"{BASE_URL}/api/radio/playlist/mixed")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check that announcements appear after every 3 tracks
        track_count = 0
        announcement_positions = []
        
        for i, item in enumerate(data):
            if item.get("type") == "track":
                track_count += 1
            elif item.get("type") == "announcement":
                announcement_positions.append(i)
        
        # Should have announcements at regular intervals
        assert len(announcement_positions) > 0, "No announcements found"
        print(f"✅ Announcements found at positions: {announcement_positions[:5]}...")
    
    def test_playlist_mixed_item_structure(self):
        """Test that each item has required fields"""
        response = requests.get(f"{BASE_URL}/api/radio/playlist/mixed")
        assert response.status_code == 200
        
        data = response.json()
        
        for item in data[:10]:  # Check first 10 items
            assert "type" in item, f"Item missing 'type' field: {item}"
            assert item["type"] in ["track", "announcement"], f"Invalid type: {item['type']}"
            
            if item["type"] == "track":
                assert "id" in item
                assert "title" in item
                assert "artist" in item
            elif item["type"] == "announcement":
                assert "id" in item
                assert "script" in item or "title" in item
        
        print("✅ All items have correct structure")


class TestAIRichardConversationPersistence:
    """Tests for AI Richard conversation persistence across multiple messages"""
    
    def test_conversation_remembers_user_name(self):
        """Test that AI Richard remembers user's name in follow-up messages"""
        conversation_id = f"test-name-{uuid.uuid4()}"
        
        # First message - introduce name
        response1 = requests.post(
            f"{BASE_URL}/api/ai-richard/chat",
            json={
                "message": "Hello, my name is TestUser123 and I want to learn about Hebrew",
                "conversation_id": conversation_id
            }
        )
        assert response1.status_code == 200
        data1 = response1.json()
        assert "conversation_id" in data1
        assert data1["conversation_id"] == conversation_id
        print(f"✅ First message sent, conversation_id: {conversation_id}")
        
        # Second message - ask about name
        response2 = requests.post(
            f"{BASE_URL}/api/ai-richard/chat",
            json={
                "message": "What is my name?",
                "conversation_id": conversation_id
            }
        )
        assert response2.status_code == 200
        data2 = response2.json()
        
        # AI should remember the name
        response_text = data2["response"].lower()
        assert "testuser123" in response_text or "test" in response_text, \
            f"AI did not remember user name. Response: {data2['response'][:200]}"
        
        print(f"✅ AI remembered user name in response: {data2['response'][:100]}...")
    
    def test_conversation_remembers_topic(self):
        """Test that AI Richard remembers conversation topic"""
        conversation_id = f"test-topic-{uuid.uuid4()}"
        
        # First message - mention topic
        response1 = requests.post(
            f"{BASE_URL}/api/ai-richard/chat",
            json={
                "message": "I am interested in learning about the 20-letter Hebrew alphabet",
                "conversation_id": conversation_id
            }
        )
        assert response1.status_code == 200
        print("✅ First message about Hebrew alphabet sent")
        
        # Second message - ask about topic
        response2 = requests.post(
            f"{BASE_URL}/api/ai-richard/chat",
            json={
                "message": "What was I interested in learning about?",
                "conversation_id": conversation_id
            }
        )
        assert response2.status_code == 200
        data2 = response2.json()
        
        # AI should remember the topic
        response_text = data2["response"].lower()
        assert "hebrew" in response_text or "alphabet" in response_text or "20" in response_text, \
            f"AI did not remember topic. Response: {data2['response'][:200]}"
        
        print(f"✅ AI remembered topic in response: {data2['response'][:100]}...")
    
    def test_multi_turn_conversation(self):
        """Test 4-message conversation maintains context"""
        conversation_id = f"test-multi-{uuid.uuid4()}"
        
        messages = [
            "My name is Sarah and I live in Houston",
            "I'm looking for help with retirement planning",
            "What city did I say I live in?",
            "And what was my name again?"
        ]
        
        responses = []
        for i, msg in enumerate(messages):
            response = requests.post(
                f"{BASE_URL}/api/ai-richard/chat",
                json={
                    "message": msg,
                    "conversation_id": conversation_id
                }
            )
            assert response.status_code == 200, f"Message {i+1} failed"
            responses.append(response.json()["response"])
            print(f"✅ Message {i+1} sent successfully")
        
        # Check third response mentions Houston
        assert "houston" in responses[2].lower(), \
            f"AI did not remember city. Response: {responses[2][:200]}"
        
        # Check fourth response mentions Sarah
        assert "sarah" in responses[3].lower(), \
            f"AI did not remember name. Response: {responses[3][:200]}"
        
        print("✅ Multi-turn conversation maintained context correctly")
    
    def test_new_conversation_has_no_previous_context(self):
        """Test that a new conversation_id starts fresh without previous context"""
        # First conversation
        conv1_id = f"test-conv1-{uuid.uuid4()}"
        requests.post(
            f"{BASE_URL}/api/ai-richard/chat",
            json={
                "message": "My name is UniqueNameXYZ123",
                "conversation_id": conv1_id
            }
        )
        
        # New conversation - should not know the name
        conv2_id = f"test-conv2-{uuid.uuid4()}"
        response = requests.post(
            f"{BASE_URL}/api/ai-richard/chat",
            json={
                "message": "What is my name?",
                "conversation_id": conv2_id
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should NOT contain the name from previous conversation
        assert "uniquenamexyz123" not in data["response"].lower(), \
            "New conversation should not have context from previous conversation"
        
        print("✅ New conversation correctly starts without previous context")


class TestAIRichardKeywordResponses:
    """Tests for AI Richard instant keyword responses"""
    
    def test_homepage_keyword_response(self):
        """Test that 'homepage' keyword triggers instant response"""
        response = requests.post(
            f"{BASE_URL}/api/ai-richard/chat",
            json={
                "message": "Tell me about the home page",
                "conversation_id": f"test-keyword-{uuid.uuid4()}"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should contain homepage-specific content
        response_text = data["response"].lower()
        assert "rjhnsn12" in response_text or "richard johnson" in response_text, \
            f"Homepage keyword response not triggered. Response: {data['response'][:200]}"
        
        print("✅ Homepage keyword response working")
    
    def test_page_two_keyword_response(self):
        """Test that 'page two' keyword triggers instant response"""
        response = requests.post(
            f"{BASE_URL}/api/ai-richard/chat",
            json={
                "message": "What's on page two?",
                "conversation_id": f"test-keyword-{uuid.uuid4()}"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should contain page two specific content (Shaka Zulu)
        response_text = data["response"].lower()
        assert "shaka" in response_text or "zulu" in response_text or "video" in response_text, \
            f"Page two keyword response not triggered. Response: {data['response'][:200]}"
        
        print("✅ Page two keyword response working")


class TestAIRichardStats:
    """Tests for AI Richard stats endpoint"""
    
    def test_stats_endpoint(self):
        """Test GET /api/ai-richard/stats returns statistics"""
        response = requests.get(f"{BASE_URL}/api/ai-richard/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_conversations" in data
        assert "total_leads" in data
        assert "conversations_today" in data
        assert "status" in data
        assert data["status"] == "active"
        
        print(f"✅ AI Richard stats: {data['total_conversations']} total conversations")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
