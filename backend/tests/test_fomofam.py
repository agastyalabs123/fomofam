"""FomoFam backend API tests - auth, events, communities, waitlist"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealth:
    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

class TestEvents:
    def test_get_events_returns_5(self):
        r = requests.get(f"{BASE_URL}/api/events")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 5

    def test_events_have_required_fields(self):
        r = requests.get(f"{BASE_URL}/api/events")
        events = r.json()
        for e in events:
            assert "event_id" in e
            assert "title" in e
            assert "lat" in e
            assert "lng" in e
            assert "_id" not in e

    def test_get_event_by_id(self):
        r = requests.get(f"{BASE_URL}/api/events/evt_001")
        assert r.status_code == 200
        data = r.json()
        assert data["event_id"] == "evt_001"
        assert data["title"] == "Seoul Web3 Builder Meetup"

    def test_get_event_not_found(self):
        r = requests.get(f"{BASE_URL}/api/events/nonexistent_id")
        assert r.status_code == 404

    def test_filter_events_by_category(self):
        r = requests.get(f"{BASE_URL}/api/events?category=Conference")
        assert r.status_code == 200
        data = r.json()
        for e in data:
            assert "conference" in e["category"].lower()

class TestCommunities:
    def test_get_communities_returns_6(self):
        r = requests.get(f"{BASE_URL}/api/communities")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6

    def test_communities_no_id(self):
        r = requests.get(f"{BASE_URL}/api/communities")
        for c in r.json():
            assert "_id" not in c

class TestWaitlist:
    def test_join_waitlist(self):
        r = requests.post(f"{BASE_URL}/api/waitlist", json={"email": "TEST_waitlist@example.com"})
        assert r.status_code == 200
        assert "message" in r.json()

    def test_duplicate_waitlist(self):
        email = "TEST_dup_waitlist@example.com"
        requests.post(f"{BASE_URL}/api/waitlist", json={"email": email})
        r = requests.post(f"{BASE_URL}/api/waitlist", json={"email": email})
        assert r.status_code == 200
        assert "Already on waitlist" in r.json()["message"]

class TestAuth:
    TEST_EMAIL = "TEST_fomofam_user@example.com"
    TEST_PASSWORD = "TestPass123!"
    TEST_NAME = "Test FomoFam User"

    def test_register(self):
        # Cleanup first in case left from prior run
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.TEST_EMAIL, "password": self.TEST_PASSWORD, "name": self.TEST_NAME
        })
        # 200 or 400 (already exists)
        assert r.status_code in [200, 400]

    def test_login(self):
        # Ensure user exists
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.TEST_EMAIL, "password": self.TEST_PASSWORD, "name": self.TEST_NAME
        })
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.TEST_EMAIL, "password": self.TEST_PASSWORD
        })
        assert r.status_code == 200
        data = r.json()
        assert "user" in data
        assert "token" in data
        assert data["user"]["email"] == self.TEST_EMAIL

    def test_login_invalid_credentials(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "notexist@example.com", "password": "wrongpass"
        })
        assert r.status_code == 401

    def test_auth_me_with_token(self):
        # Login to get token
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.TEST_EMAIL, "password": self.TEST_PASSWORD
        })
        if r.status_code != 200:
            pytest.skip("Login failed")
        token = r.json()["token"]
        me = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["email"] == self.TEST_EMAIL

    def test_auth_me_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401
