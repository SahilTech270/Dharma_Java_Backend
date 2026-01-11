"""
Test suite for Booking APIs
Tests: Create, Read All, Read One, Read by User, Update, Delete
"""
import pytest
from datetime import date, timedelta


@pytest.mark.booking
class TestBookingAPIs:
    
    def test_create_booking_success(self, test_client, registered_user, registered_admin, created_temple):
        """Test successful booking creation"""
        # First create a slot
        today = date.today()
        slot_date = today + timedelta(days=7)
        
        slot_data = {
            "templeId": created_temple["templeId"],
            "date": slot_date.isoformat(),
            "startTime": "09:00:00",
            "endTime": "11:00:00",
            "capacity": 100
        }
        slot_response = test_client.post(
            "/slots/",
            json=slot_data,
            headers=registered_admin["headers"]
        )
        slot_id = slot_response.json()["slotId"]
        
        # Create booking
        booking_data = {
            "bookingType": "ONLINE",
            "special": False,
            "bookingDate": slot_date.isoformat(),
            "templeId": created_temple["templeId"],
            "userId": registered_user["user_id"],
            "slotId": slot_id
        }
        response = test_client.post("/bookings/", json=booking_data)
        assert response.status_code == 201
        data = response.json()
        assert data["templeId"] == created_temple["templeId"]
        assert data["userId"] == registered_user["user_id"]
        assert "bookingId" in data
    
    def test_get_all_bookings(self, test_client, registered_admin):
        """Test getting all bookings (requires admin)"""
        response = test_client.get("/bookings/", headers=registered_admin["headers"])
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_booking_by_id(self, test_client, registered_user, registered_admin, created_temple):
        """Test getting specific booking by ID"""
        # Create booking first
        today = date.today()
        booking_date = today + timedelta(days=5)
        
        booking_data = {
            "bookingType": "ONLINE",
            "special": False,
            "bookingDate": booking_date.isoformat(),
            "templeId": created_temple["templeId"],
            "userId": registered_user["user_id"]
        }
        create_response = test_client.post("/bookings/", json=booking_data)
        booking_id = create_response.json()["bookingId"]
        
        # Get the booking
        response = test_client.get(f"/bookings/{booking_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["bookingId"] == booking_id
    
    def test_get_bookings_by_user(self, test_client, registered_user, created_temple):
        """Test getting all bookings for a user"""
        # Create a booking for the user
        today = date.today()
        booking_date = today + timedelta(days=3)
        
        booking_data = {
            "bookingType": "ONLINE",
            "special": True,
            "bookingDate": booking_date.isoformat(),
            "templeId": created_temple["templeId"],
            "userId": registered_user["user_id"]
        }
        test_client.post("/bookings/", json=booking_data)
        
        # Get bookings by user
        response = test_client.get(f"/bookings/user/{registered_user['user_id']}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        for booking in data:
            assert booking["userId"] == registered_user["user_id"]
    
    def test_delete_booking_success(self, test_client, registered_user, created_temple):
        """Test deleting a booking"""
        # Create a booking
        today = date.today()
        booking_date = today + timedelta(days=10)
        
        booking_data = {
            "bookingType": "ONLINE",
            "special": False,
            "bookingDate": booking_date.isoformat(),
            "templeId": created_temple["templeId"],
            "userId": registered_user["user_id"]
        }
        create_response = test_client.post("/bookings/", json=booking_data)
        booking_id = create_response.json()["bookingId"]
        
        # Delete the booking
        response = test_client.delete(f"/bookings/{booking_id}")
        assert response.status_code == 200
