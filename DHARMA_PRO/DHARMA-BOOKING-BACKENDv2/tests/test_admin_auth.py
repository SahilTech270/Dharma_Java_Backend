"""
Test suite for Admin Authentication APIs
Tests: Registration, Login, Profile (GET/PUT/DELETE)
"""
import pytest


@pytest.mark.auth
@pytest.mark.admin
class TestAdminAuthentication:
    
    def test_admin_registration_success(self, test_client, test_admin_data):
        """Test successful admin registration"""
        response = test_client.post("/admin/auth/register", json=test_admin_data)
        assert response.status_code in [200, 201]
        data = response.json()
        assert "message" in data or "adminId" in data
    
    def test_admin_login_success(self, test_client, registered_admin):
        """Test successful admin login"""
        login_data = {
            "username": registered_admin["admin_data"]["email"],
            "password": registered_admin["admin_data"]["password"]
        }
        response = test_client.post(
            "/admin/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_admin_login_wrong_password(self, test_client, registered_admin):
        """Test admin login with wrong password fails"""
        login_data = {
            "username": registered_admin["admin_data"]["email"],
            "password": "wrongpassword"
        }
        response = test_client.post(
            "/admin/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code in [400, 401]
    
    def test_get_admin_profile(self, test_client, registered_admin):
        """Test getting admin profile"""
        response = test_client.get("/admin/auth/me", headers=registered_admin["headers"])
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == registered_admin["admin_data"]["email"]
    
    def test_update_admin_profile(self, test_client, registered_admin):
        """Test updating admin profile"""
        update_data = {
            "adminName": "Updated Admin Name"
        }
        response = test_client.put("/admin/auth/update", json=update_data, headers=registered_admin["headers"])
        assert response.status_code == 200
        data = response.json()
        assert data["adminName"] == "Updated Admin Name"
    
    def test_delete_admin_profile(self, test_client, registered_admin):
        """Test deleting admin profile"""
        response = test_client.delete("/admin/auth/delete", headers=registered_admin["headers"])
        assert response.status_code == 200
