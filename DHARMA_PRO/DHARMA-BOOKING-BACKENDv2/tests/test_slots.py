"""
Test suite for Slot (Booking/Darshan) APIs
Tests: Create, Read All, Read One, Update, Delete
"""
import pytest
from datetime import date, time, timedelta


@pytest.mark.slot
class TestSlotAPIs:
    
    def test_create_slot_success(self, test_client, registered_admin, created_temple):
        """Test successful slot creation by admin"""
        today = date.today()
        slot_date = today + timedelta(days=7)  # Create slot for next week
        
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": slot_date.isoformat(),
            "startTime": "09:00:00",
            "endTime": "11:00:00",
            "capacity": 100,
            "reservedOfflineTickets": 20,
            "remaining": 80
        }
        
        response = test_client.post(
            "/slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 201
        data = response.json()
        assert data["templeId"] == created_temple["templeId"]
        assert data["capacity"] == 100
        assert "slotId" in data
    
    def test_create_slot_unauthorized(self, test_client, created_temple):
        """Test slot creation without auth fails"""
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": "2025-12-15",
            "startTime": "09:00:00",
            "endTime": "11:00:00",
            "capacity": 100
        }
        response = test_client.post("/slots/", json=slot_data)
        assert response.status_code in [401, 403]
    
    def test_create_slot_invalid_time(self, test_client, registered_admin, created_temple):
        """Test creating slot with endTime before startTime fails"""
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": "2025-12-15",
            "startTime": "11:00:00",
            "endTime": "09:00:00",  # Invalid: before startTime
            "capacity": 100
        }
        response = test_client.post(
            "/slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 400
    
    def test_get_all_slots(self, test_client, registered_admin, created_temple):
        """Test getting all slots"""
        # First create a slot
        today = date.today()
        slot_date = today + timedelta(days=7)
        
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": slot_date.isoformat(),
            "startTime": "14:00:00",
            "endTime": "16:00:00",
            "capacity": 50
        }
        test_client.post("/slots/", json=slot_data, headers=registered_admin["headers"])
        
        # Get all slots
        response = test_client.get("/slots/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_slots_by_temple(self, test_client, registered_admin, created_temple):
        """Test filtering slots by temple ID"""
        # Create a slot for the temple
        today = date.today()
        slot_date = today + timedelta(days=7)
        
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": slot_date.isoformat(),
            "startTime": "10:00:00",
            "endTime": "12:00:00",
            "capacity": 75
        }
        test_client.post("/slots/", json=slot_data, headers=registered_admin["headers"])
        
        # Get slots by temple
        response = test_client.get(f"/slots/?templeId={created_temple['templeId']}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for slot in data:
            assert slot["templeId"] == created_temple["templeId"]
    
    def test_get_slot_by_id(self, test_client, registered_admin, created_temple):
        """Test getting a specific slot by ID"""
        # Create a slot
        today = date.today()
        slot_date = today + timedelta(days=7)
        
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": slot_date.isoformat(),
            "startTime": "08:00:00",
            "endTime": "10:00:00",
            "capacity": 100
        }
        create_response = test_client.post(
            "/slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        slot_id = create_response.json()["slotId"]
        
        # Get the slot
        response = test_client.get(f"/slots/{slot_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["slotId"] == slot_id
    
    def test_update_slot_success(self, test_client, registered_admin, created_temple):
        """Test updating slot capacity"""
        # Create a slot
        today = date.today()
        slot_date = today + timedelta(days=7)
        
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": slot_date.isoformat(),
            "startTime": "13:00:00",
            "endTime": "15:00:00",
            "capacity": 80
        }
        create_response = test_client.post(
            "/slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        slot_id = create_response.json()["slotId"]
        
        # Update the slot
        update_data = {
            "capacity": 120,
            "reservedOfflineTickets": 30
        }
        response = test_client.put(
            f"/slots/{slot_id}",
            json=update_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 200
        data = response.json()
        assert data["capacity"] == 120
    
    def test_delete_slot_success(self, test_client, registered_admin, created_temple):
        """Test deleting a slot"""
        # Create a slot
        today = date.today()
        slot_date = today + timedelta(days=7)
        
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": slot_date.isoformat(),
            "startTime": "16:00:00",
            "endTime": "18:00:00",
            "capacity": 60
        }
        create_response = test_client.post(
            "/slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        slot_id = create_response.json()["slotId"]
        
        # Delete the slot
        response = test_client.delete(
            f"/slots/{slot_id}",
            headers=registered_admin["headers"]
        )
        assert response.status_code == 200
        
        # Verify deletion
        response = test_client.get(f"/slots/{slot_id}")
        assert response.status_code == 404
