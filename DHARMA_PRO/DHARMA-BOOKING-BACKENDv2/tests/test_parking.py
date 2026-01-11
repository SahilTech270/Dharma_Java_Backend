"""
Test suite for Parking and Parking Slot APIs
Tests: Parking zones and parking slots CRUD operations
"""
import pytest


@pytest.mark.parking
class TestParkingAPIs:
    
    def test_create_parking_zone_success(self, test_client, registered_admin, created_temple):
        """Test creating a parking zone"""
        parking_data = {
            "templeId": created_temple["templeId"],
            "totalSlots": 100,
            "freeSlots": 100,
            "filledSlots": 0,
            "twoWheeler": 60,
            "fourWheeler": 40,
            "cctvCount": 10,
            "status": True
        }
        response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 201
        data = response.json()
        assert data["templeId"] == created_temple["templeId"]
        assert data["totalSlots"] == 100
        assert "parkingId" in data
    
    def test_get_all_parking_zones(self, test_client):
        """Test getting all parking zones"""
        response = test_client.get("/parking/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_parking_zone_by_id(self, test_client, registered_admin, created_temple):
        """Test getting parking zone by ID"""
        # Create parking zone
        parking_data = {
            "templeId": created_temple["templeId"],
            "totalSlots": 50,
            "freeSlots": 50
        }
        create_response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        parking_id = create_response.json()["parkingId"]
        
        # Get the parking zone
        response = test_client.get(f"/parking/{parking_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["parkingId"] == parking_id
    
    def test_get_parking_by_temple(self, test_client, registered_admin, created_temple):
        """Test getting parking zones by temple ID"""
        # Create parking zone
        parking_data = {
            "templeId": created_temple["templeId"],
            "totalSlots": 75
        }
        test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        
        # Get parking by temple
        response = test_client.get(f"/parking/temple/{created_temple['templeId']}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for parking in data:
            assert parking["templeId"] == created_temple["templeId"]
    
    def test_update_parking_zone(self, test_client, registered_admin, created_temple):
        """Test updating parking zone"""
        # Create parking zone
        parking_data = {
            "templeId": created_temple["templeId"],
            "totalSlots": 100
        }
        create_response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        parking_id = create_response.json()["parkingId"]
        
        # Update the parking zone
        update_data = {
            "freeSlots": 80,
            "filledSlots": 20
        }
        response = test_client.put(
            f"/parking/{parking_id}",
            json=update_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 200
        data = response.json()
        assert data["freeSlots"] == 80
        assert data["filledSlots"] == 20
    
    def test_delete_parking_zone(self, test_client, registered_admin, created_temple):
        """Test deleting parking zone"""
        # Create parking zone
        parking_data = {
            "templeId": created_temple["templeId"],
            "totalSlots": 30
        }
        create_response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        parking_id = create_response.json()["parkingId"]
        
        # Delete the parking zone
        response = test_client.delete(
            f"/parking/{parking_id}",
            headers=registered_admin["headers"]
        )
        assert response.status_code == 204


@pytest.mark.parking
class TestParkingSlotAPIs:
    
    def test_create_parking_slot_success(self, test_client, registered_admin, created_temple):
        """Test creating a parking slot"""
        # First create a parking zone
        parking_data = {
            "templeId": created_temple["templeId"],
            "totalSlots": 50
        }
        parking_response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        parking_id = parking_response.json()["parkingId"]
        
        # Create parking slot
        slot_data = {
            "parkingId": parking_id,
            "slotAvailability": True,
            "status": True,
            "slotCapacity": 1
        }
        response = test_client.post(
            "/parking-slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 201
        data = response.json()
        assert data["parkingId"] == parking_id
        assert data["slotAvailability"] == True
        assert "slotId" in data
    
    def test_get_all_parking_slots(self, test_client):
        """Test getting all parking slots"""
        response = test_client.get("/parking-slots/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_parking_slot_by_id(self, test_client, registered_admin, created_temple):
        """Test getting parking slot by ID"""
        # Create parking zone and slot
        parking_data = {"templeId": created_temple["templeId"], "totalSlots": 20}
        parking_response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        parking_id = parking_response.json()["parkingId"]
        
        slot_data = {
            "parkingId": parking_id,
            "slotAvailability": True,
            "slotCapacity": 1
        }
        create_response = test_client.post(
            "/parking-slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        slot_id = create_response.json()["slotId"]
        
        # Get the slot
        response = test_client.get(f"/parking-slots/{slot_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["slotId"] == slot_id
    
    def test_get_slots_by_parking_id(self, test_client, registered_admin, created_temple):
        """Test getting all slots for a parking zone"""
        # Create parking zone
        parking_data = {"templeId": created_temple["templeId"], "totalSlots": 15}
        parking_response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        parking_id = parking_response.json()["parkingId"]
        
        # Create a slot
        slot_data = {
            "parkingId": parking_id,
            "slotAvailability": False,
            "slotCapacity": 1
        }
        test_client.post(
            "/parking-slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        
        # Get slots by parking ID
        response = test_client.get(f"/parking-slots/parking/{parking_id}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for slot in data:
            assert slot["parkingId"] == parking_id
    
    def test_update_parking_slot(self, test_client, registered_admin, created_temple):
        """Test updating parking slot availability"""
        # Create parking zone and slot
        parking_data = {"templeId": created_temple["templeId"], "totalSlots": 25}
        parking_response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        parking_id = parking_response.json()["parkingId"]
        
        slot_data = {
            "parkingId": parking_id,
            "slotAvailability": True,
            "slotCapacity": 1
        }
        create_response = test_client.post(
            "/parking-slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        slot_id = create_response.json()["slotId"]
        
        # Update the slot
        update_data = {"slotAvailability": False}
        response = test_client.put(
            f"/parking-slots/{slot_id}",
            json=update_data,
            headers=registered_admin["headers"]
        )
        assert response.status_code == 200
        data = response.json()
        assert data["slotAvailability"] == False
    
    def test_delete_parking_slot(self, test_client, registered_admin, created_temple):
        """Test deleting parking slot"""
        # Create parking zone and slot
        parking_data = {"templeId": created_temple["templeId"], "totalSlots": 10}
        parking_response = test_client.post(
            "/parking/",
            json=parking_data,
            headers=registered_admin["headers"]
        )
        parking_id = parking_response.json()["parkingId"]
        
        slot_data = {
            "parkingId": parking_id,
            "slotAvailability": True,
            "slotCapacity": 1
        }
        create_response = test_client.post(
            "/parking-slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        slot_id = create_response.json()["slotId"]
        
        # Delete the slot
        response = test_client.delete(
            f"/parking-slots/{slot_id}",
            headers=registered_admin["headers"]
        )
        assert response.status_code == 204
