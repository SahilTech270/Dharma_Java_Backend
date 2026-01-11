"""
Test suite for User Authentication APIs
Tests: Registration, Login, Profile (GET/PUT/DELETE)
"""
import pytest


@pytest.mark.auth
@pytest.mark.user
class TestUserAuthentication:
    
    def test_user_registration_success(self, test_client, test_user_data):
        """Test successful user registration"""
        response = test_client.post("/users/register", json=test_user_data)
        assert response.status_code in [200, 201]
        data = response.json()
        assert "message" in data or "userId" in data
    
    def test_user_registration_duplicate_email(self, test_client, registered_user, test_user_data):
        """Test registration with duplicate email fails"""
        # Try to register with same email
        duplicate_data = test_user_data.copy()
        duplicate_data["email"] = registered_user["user_data"]["email"]
        duplicate_data["userName"] = "differentuser"
        duplicate_data["mobileNumber"] = "9999999999"
        
        response = test_client.post("/users/register", json=duplicate_data)
        assert response.status_code in [400, 409]  # Bad request or conflict
    
    def test_user_login_success(self, test_client, registered_user):
        """Test successful user login"""
        login_data = {
            "identifier": registered_user["user_data"]["email"],
            "password": registered_user["user_data"]["password"]
        }
        response = test_client.post("/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "userId" in data
    
    def test_user_login_wrong_password(self, test_client, registered_user):
        """Test login with wrong password fails"""
        login_data = {
            "identifier": registered_user["user_data"]["email"],
            "password": "wrongpassword"
        }
        response = test_client.post("/auth/login", json=login_data)
        assert response.status_code in [400, 401]
    
    def test_get_user_profile(self, test_client, registered_user):
        """Test getting user profile"""
        response = test_client.get("/users/me", headers=registered_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == registered_user["user_data"]["email"]
        assert data["userName"] == registered_user["user_data"]["userName"]
    
    def test_update_user_profile(self, test_client, registered_user):
        """Test updating user profile"""
        update_data = {
            "firstName": "UpdatedFirstName",
            "city": "Mumbai"
        }
        response = test_client.put("/users/me", json=update_data, headers=registered_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert data["firstName"] == "UpdatedFirstName"
        assert data["city"] == "Mumbai"
    
    def test_delete_user_profile(self, test_client, registered_user):
        """Test deleting user profile"""
        response = test_client.delete("/users/me", headers=registered_user["headers"])
        assert response.status_code == 204
        
        # Verify user can't access profile after deletion
        response = test_client.get("/users/me", headers=registered_user["headers"])
        assert response.status_code in [401, 404]
