"""
Backend API Tests for Radio Station and Donation System
Tests: Radio playlist, track upload, DJ announcements (OpenAI TTS), donation checkout
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestRadioPlaylist:
    """Radio playlist endpoint tests"""
    
    def test_get_playlist(self):
        """Test GET /api/radio/playlist returns track list"""
        response = requests.get(f"{BASE_URL}/api/radio/playlist")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Playlist endpoint working - {len(data)} tracks found")
        
        # Verify track structure if tracks exist
        if len(data) > 0:
            track = data[0]
            assert "id" in track
            assert "title" in track
            assert "artist" in track
            print(f"   First track: {track['title']} by {track['artist']}")
    
    def test_get_specific_track(self):
        """Test GET /api/radio/track/{track_id} returns track details"""
        # First get playlist to get a track ID
        playlist_response = requests.get(f"{BASE_URL}/api/radio/playlist")
        assert playlist_response.status_code == 200
        
        tracks = playlist_response.json()
        if len(tracks) == 0:
            pytest.skip("No tracks in playlist to test")
        
        track_id = tracks[0]["id"]
        
        # Get specific track
        response = requests.get(f"{BASE_URL}/api/radio/track/{track_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == track_id
        assert "title" in data
        assert "artist" in data
        assert "audio_data" in data or "audio_url" in data
        print(f"✅ Get track endpoint working - Track: {data['title']}")
    
    def test_get_nonexistent_track(self):
        """Test GET /api/radio/track/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/radio/track/nonexistent-track-id")
        assert response.status_code == 404
        print("✅ Nonexistent track correctly returns 404")


class TestRadioTrackUpload:
    """Radio track upload endpoint tests"""
    
    def test_upload_track(self):
        """Test POST /api/radio/track/upload uploads audio file"""
        # Create a small test audio file (WAV header)
        wav_header = bytes([
            0x52, 0x49, 0x46, 0x46,  # "RIFF"
            0x24, 0x00, 0x00, 0x00,  # File size
            0x57, 0x41, 0x56, 0x45,  # "WAVE"
            0x66, 0x6D, 0x74, 0x20,  # "fmt "
            0x10, 0x00, 0x00, 0x00,  # Chunk size
            0x01, 0x00,              # Audio format (PCM)
            0x01, 0x00,              # Num channels
            0x44, 0xAC, 0x00, 0x00,  # Sample rate (44100)
            0x88, 0x58, 0x01, 0x00,  # Byte rate
            0x02, 0x00,              # Block align
            0x10, 0x00,              # Bits per sample
            0x64, 0x61, 0x74, 0x61,  # "data"
            0x00, 0x00, 0x00, 0x00   # Data size
        ])
        
        files = {
            'audio_file': ('TEST_track.wav', io.BytesIO(wav_header), 'audio/wav')
        }
        data = {
            'title': 'TEST_Upload Track',
            'artist': 'TEST_Artist',
            'duration': 120
        }
        
        response = requests.post(
            f"{BASE_URL}/api/radio/track/upload",
            files=files,
            data=data
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["status"] == "uploaded"
        assert "track_id" in result
        assert result["title"] == "TEST_Upload Track"
        
        print(f"✅ Track upload working - Track ID: {result['track_id']}")
        return result["track_id"]
    
    def test_upload_track_missing_file(self):
        """Test upload without file returns error"""
        data = {
            'title': 'TEST_No File Track',
            'artist': 'TEST_Artist',
            'duration': 120
        }
        
        response = requests.post(
            f"{BASE_URL}/api/radio/track/upload",
            data=data
        )
        
        # Should return 422 (validation error) for missing required file
        assert response.status_code == 422
        print("✅ Upload without file correctly rejected")


class TestRadioTrackDelete:
    """Radio track deletion tests"""
    
    def test_delete_track(self):
        """Test DELETE /api/radio/track/{track_id} removes track"""
        # First upload a track to delete
        wav_header = bytes([
            0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
            0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20,
            0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
            0x44, 0xAC, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
            0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
            0x00, 0x00, 0x00, 0x00
        ])
        
        files = {
            'audio_file': ('TEST_delete_track.wav', io.BytesIO(wav_header), 'audio/wav')
        }
        data = {
            'title': 'TEST_Track To Delete',
            'artist': 'TEST_Artist',
            'duration': 60
        }
        
        upload_response = requests.post(
            f"{BASE_URL}/api/radio/track/upload",
            files=files,
            data=data
        )
        assert upload_response.status_code == 200
        track_id = upload_response.json()["track_id"]
        
        # Now delete the track
        delete_response = requests.delete(f"{BASE_URL}/api/radio/track/{track_id}")
        assert delete_response.status_code == 200
        assert delete_response.json()["status"] == "deleted"
        
        # Verify track is gone
        get_response = requests.get(f"{BASE_URL}/api/radio/track/{track_id}")
        assert get_response.status_code == 404
        
        print(f"✅ Track deletion working - Track {track_id} deleted and verified")
    
    def test_delete_nonexistent_track(self):
        """Test DELETE nonexistent track returns 404"""
        response = requests.delete(f"{BASE_URL}/api/radio/track/nonexistent-track-id")
        assert response.status_code == 404
        print("✅ Delete nonexistent track correctly returns 404")


class TestDJAnnouncements:
    """DJ announcement endpoint tests (OpenAI TTS)"""
    
    def test_get_dj_announcements(self):
        """Test GET /api/radio/dj/announcements returns list"""
        response = requests.get(f"{BASE_URL}/api/radio/dj/announcements")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ DJ announcements endpoint working - {len(data)} announcements found")
        
        # Verify structure if announcements exist
        if len(data) > 0:
            announcement = data[0]
            assert "id" in announcement
            assert "script" in announcement
            assert "voice" in announcement
            assert "audio_data" in announcement
            print(f"   First announcement voice: {announcement['voice']}")
    
    def test_create_dj_announcement(self):
        """Test POST /api/radio/dj/announcement generates TTS audio"""
        payload = {
            "script": "TEST: This is a test DJ announcement for RJHNSN12 Radio!",
            "voice": "nova",
            "position": "between_tracks"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/radio/dj/announcement",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "generated"
        assert "announcement_id" in data
        assert "audio_data" in data
        assert len(data["audio_data"]) > 100  # Should have base64 audio data
        
        print(f"✅ DJ announcement generation working - ID: {data['announcement_id']}")
        return data["announcement_id"]
    
    def test_create_dj_announcement_different_voice(self):
        """Test DJ announcement with different voice option"""
        payload = {
            "script": "TEST: Testing the onyx voice for deep announcements.",
            "voice": "onyx",
            "position": "intro"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/radio/dj/announcement",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "generated"
        print(f"✅ DJ announcement with 'onyx' voice working")


class TestDonationSystem:
    """Donation checkout endpoint tests"""
    
    def test_create_donation_session_5_dollars(self):
        """Test POST /api/payments/v1/donation/session creates $5 donation"""
        payload = {
            "amount": 5.0,
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "donor_name": "TEST_Donor_5"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/donation/session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert "checkout.stripe.com" in data["url"] or "integrations.emergentagent.com" in data["url"]
        
        print(f"✅ $5 donation session created - Session: {data['session_id'][:30]}...")
    
    def test_create_donation_session_10_dollars(self):
        """Test POST /api/payments/v1/donation/session creates $10 donation"""
        payload = {
            "amount": 10.0,
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "donor_name": "TEST_Donor_10"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/donation/session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        
        print(f"✅ $10 donation session created")
    
    def test_create_donation_session_25_dollars(self):
        """Test POST /api/payments/v1/donation/session creates $25 donation"""
        payload = {
            "amount": 25.0,
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "donor_name": "TEST_Donor_25"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/donation/session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        
        print(f"✅ $25 donation session created")
    
    def test_create_donation_session_custom_amount(self):
        """Test donation with custom amount"""
        payload = {
            "amount": 50.0,
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "donor_name": "TEST_Custom_Donor"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/donation/session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        
        print(f"✅ Custom $50 donation session created")
    
    def test_donation_amount_too_low(self):
        """Test donation below $1 is rejected"""
        payload = {
            "amount": 0.50,
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "donor_name": "TEST_Low_Donor"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/donation/session",
            json=payload
        )
        
        assert response.status_code == 400
        print("✅ Donation below $1 correctly rejected")
    
    def test_donation_amount_too_high(self):
        """Test donation above $10,000 is rejected"""
        payload = {
            "amount": 15000.0,
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "donor_name": "TEST_High_Donor"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/donation/session",
            json=payload
        )
        
        assert response.status_code == 400
        print("✅ Donation above $10,000 correctly rejected")
    
    def test_donation_stored_in_database(self):
        """Test donation transaction is stored in MongoDB"""
        payload = {
            "amount": 15.0,
            "origin_url": "https://talk-web-combo.preview.emergentagent.com",
            "donor_name": "TEST_Persistence_Donor"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/v1/donation/session",
            json=payload
        )
        assert response.status_code == 200
        session_id = response.json()["session_id"]
        
        # Verify in transactions
        transactions_response = requests.get(f"{BASE_URL}/api/analytics/transactions")
        assert transactions_response.status_code == 200
        
        transactions = transactions_response.json()
        session_ids = [t.get("session_id") for t in transactions]
        assert session_id in session_ids, "Donation transaction not found in database"
        
        # Verify donation data
        donation = next(t for t in transactions if t.get("session_id") == session_id)
        assert donation["amount"] == 15.0
        assert donation["type"] == "donation"
        assert donation["donor_name"] == "TEST_Persistence_Donor"
        
        print(f"✅ Donation correctly stored in MongoDB - Amount: ${donation['amount']}")


class TestAnalyticsDashboardRevenue:
    """Test analytics dashboard revenue separation"""
    
    def test_dashboard_has_separate_revenue_fields(self):
        """Test GET /api/analytics/dashboard returns separate content and donation revenue"""
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        payments = data["payments"]
        
        # Verify all revenue fields exist
        assert "total_revenue" in payments
        assert "content_revenue" in payments
        assert "donation_revenue" in payments
        assert "successful_payments" in payments
        assert "total_donations" in payments
        
        # Verify total = content + donation
        total = payments["total_revenue"]
        content = payments["content_revenue"]
        donation = payments["donation_revenue"]
        
        # Allow small floating point difference
        assert abs(total - (content + donation)) < 0.01, \
            f"Total revenue ({total}) should equal content ({content}) + donation ({donation})"
        
        print(f"✅ Dashboard revenue separation working:")
        print(f"   Total: ${total}, Content: ${content}, Donations: ${donation}")
    
    def test_dashboard_recent_transactions_show_donation_type(self):
        """Test recent transactions include donation type info"""
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        transactions = data["payments"]["recent_transactions"]
        
        # Find a donation transaction
        donations = [t for t in transactions if t.get("type") == "donation"]
        
        if len(donations) > 0:
            donation = donations[0]
            assert "donor_name" in donation
            print(f"✅ Donation transactions have type='donation' and donor_name field")
        else:
            print("⚠️ No donation transactions found to verify type field")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_tracks(self):
        """Remove TEST_ prefixed tracks"""
        response = requests.get(f"{BASE_URL}/api/radio/playlist")
        if response.status_code == 200:
            tracks = response.json()
            test_tracks = [t for t in tracks if t.get("title", "").startswith("TEST_")]
            
            for track in test_tracks:
                requests.delete(f"{BASE_URL}/api/radio/track/{track['id']}")
            
            print(f"✅ Cleaned up {len(test_tracks)} test tracks")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
