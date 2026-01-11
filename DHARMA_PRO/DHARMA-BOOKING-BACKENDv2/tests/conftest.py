"""
Shared fixtures for API testing
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from database.database import Base, engine
import os
from dotenv import load_dotenv

load_dotenv()

@pytest.fixture(scope="session")
def test_client():
    """Create a test client for the FastAPI app"""
    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="session")
def base_url():
    """Base URL for API requests"""
    return "http://localhost:8000"


@pytest.fixture(scope="function")
def test_user_data():
    """Sample user data for testing"""
    import random
    rand_num = random.randint(1000, 9999)
    return {
        "userName": f"testuser{rand_num}",
        "firstName": "Test",
        "lastName": "User",
        "mobileNumber": f"98765{rand_num}",
        "email": f"testuser{rand_num}@example.com",
        "gender": "Male",
        "state": "Karnataka",
        "city": "Bangalore",
        "password": "testpass123"
    }


@pytest.fixture(scope="function")
def test_admin_data():
    """Sample admin data for testing"""
    import random
    rand_num = random.randint(1000, 9999)
    return {
        "adminName": f"testadmin{rand_num}",
        "email": f"testadmin{rand_num}@example.com",
        "password": "adminpass123"
    }


@pytest.fixture(scope="function")
def registered_user(test_client, test_user_data):
    """Register a user and return user data with token"""
    # Register user
    response = test_client.post("/users/register", json=test_user_data)
    assert response.status_code in [200, 201], f"Registration failed: {response.json()}"
    
    # Login to get token
    login_data = {
        "identifier": test_user_data["email"],
        "password": test_user_data["password"]
    }
    login_response = test_client.post("/auth/login", json=login_data)
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    
    token = login_response.json().get("access_token")
    user_id = login_response.json().get("userId")
    
    return {
        "user_data": test_user_data,
        "token": token,
        "user_id": user_id,
        "headers": {"Authorization": f"Bearer {token}"}
    }


@pytest.fixture(scope="function")
def registered_admin(test_client, test_admin_data):
    """Register an admin and return admin data with token"""
    # Register admin
    response = test_client.post("/admin/auth/register", json=test_admin_data)
    assert response.status_code in [200, 201], f"Admin registration failed: {response.json()}"
    
    # Login to get token
    from urllib.parse import urlencode
    login_data = {
        "username": test_admin_data["email"],
        "password": test_admin_data["password"]
    }
    login_response = test_client.post(
        "/admin/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert login_response.status_code == 200, f"Admin login failed: {login_response.json()}"
    
    token = login_response.json().get("access_token")
    admin_id = login_response.json().get("adminId")
    
    return {
        "admin_data": test_admin_data,
        "token": token,
        "admin_id": admin_id,
        "headers": {"Authorization": f"Bearer {token}"}
    }


@pytest.fixture(scope="function")
def test_temple_data():
    """Sample temple data for testing"""
    import random
    rand_num = random.randint(1000, 9999)
    return {
        "templeName": f"Test Temple {rand_num}",
        "location": f"Test Location {rand_num}"
    }


@pytest.fixture(scope="function")
def created_temple(test_client, registered_admin, test_temple_data):
    """Create a temple and return temple data"""
    response = test_client.post(
        "/temples/",
        json=test_temple_data,
        headers=registered_admin["headers"]
    )
    assert response.status_code == 201, f"Temple creation failed: {response.json()}"
    
    temple = response.json()
    return temple
