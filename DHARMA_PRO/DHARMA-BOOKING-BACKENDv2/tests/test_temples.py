"""
Test suite for Temple APIs
Tests: Create, Read All, Read One, Update, Delete
"""
import pytest


@pytest.mark.temple
class TestTempleAPIs:
    
    def test_create_temple_success(self, test_client, registered_admin, test_temple_data):
        """Test successful temple creation by admin"""
        response = test_client.post(
            "/temples/",
            json=test_temple_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 201
        data = response.json()
        assert data["templeName"] == test_temple_data["templeName"]
        assert data["location"] == test_temple_data["location"]
        assert "templeId" in data
    
    def test_create_temple_unauthorized(self, test_client, test_temple_data):
        """Test temple creation without auth fails"""
        response = test_client.post("/temples/", json=test_temple_data)
        assert response.status_code in [401, 403]
    
    def test_get_all_temples(self, test_client, created_temple):
        """Test getting all temples (public endpoint)"""
        response = test_client.get("/temples/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_temple_by_id(self, test_client, created_temple):
        """Test getting a specific temple by ID"""
        temple_id = created_temple["templeId"]
        response = test_client.get(f"/temples/{temple_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["templeId"] == temple_id
        assert data["templeName"] == created_temple["templeName"]
    
    def test_get_temple_not_found(self, test_client):
        """Test getting non-existent temple returns 404"""
        response = test_client.get("/temples/99999")
        assert response.status_code == 404
    
    def test_update_temple_success(self, test_client, registered_admin, created_temple):
        """Test updating temple by admin"""
        temple_id = created_temple["templeId"]
        update_data = {
            "templeName": "Updated Temple Name",
            "location": "Updated Location"
        }
        response = test_client.put(
            f"/temples/{temple_id}",
            json=update_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 200
        data = response.json()
        assert data["templeName"] == "Updated Temple Name"
        assert data["location"] == "Updated Location"
    
    def test_update_temple_unauthorized(self, test_client, created_temple):
        """Test updating temple without auth fails"""
        temple_id = created_temple["templeId"]
        update_data = {"templeName": "Hacked Name"}
        response = test_client.put(f"/temples/{temple_id}", json=update_data)
        assert response.status_code in [401, 403]
    
    def test_delete_temple_success(self, test_client, registered_admin, created_temple):
        """Test deleting temple by admin"""
        temple_id = created_temple["templeId"]
        response = test_client.delete(
            f"/temples/{temple_id}",
            headers=registered_admin["headers"]
        )
        assert response.status_code == 200
        
        # Verify temple is deleted
        response = test_client.get(f"/temples/{temple_id}")
        assert response.status_code == 404
