import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import requests
import json
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def print_response(response, label):
    print(f"\n--- {label} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    return response

def run_test():
    with open("debug_output.txt", "w") as f:
        def log(msg):
            print(msg)
            f.write(str(msg) + "\n")
        
        def log_response(response, label):
            log(f"\n--- {label} ---")
            log(f"Status Code: {response.status_code}")
            try:
                log(json.dumps(response.json(), indent=2))
            except:
                log(response.text)
            return response

        # 1. Register User
        user_payload = {
            "userName": "testuser_booking",
            "firstName": "Test",
            "lastName": "User",
            "mobileNumber": "1234567890",
            "email": "testuser_booking@example.com",
            "gender": "Male",
            "state": "TestState",
            "city": "TestCity",
            "password": "password123"
        }
        # Try login first to see if user exists
        log("Checking user...")
        login_res = requests.post(f"{BASE_URL}/auth/login", json={"identifier": user_payload["userName"], "password": user_payload["password"]})
        
        if login_res.status_code == 200:
            log("User already exists, logging in...")
            user_id = login_res.json()["userId"]
        else:
            log("Registering new user...")
            reg_res = log_response(requests.post(f"{BASE_URL}/users/register", json=user_payload), "Register User")
            if reg_res.status_code != 200:
                return
            user_id = reg_res.json()["userId"]

        # 2. Create Temple
        temple_payload = {
            "templeName": "Test Temple For Booking",
            "location": "Test Location"
        }
        # Check if temple exists
        log("Checking temples...")
        temples_res = requests.get(f"{BASE_URL}/temples/")
        if temples_res.status_code != 200:
            log_response(temples_res, "Get Temples Failed")
            return

        temple_id = None
        temples_data = temples_res.json()
        if isinstance(temples_data, list):
            for t in temples_data:
                if t.get("templeName") == temple_payload["templeName"]:
                    temple_id = t["templeId"]
                    break
        else:
            log(f"Unexpected temples response format: {type(temples_data)}")
            log(temples_data)
        
        if not temple_id:
            log("Creating new temple...")
            temple_res = log_response(requests.post(f"{BASE_URL}/temples/", json=temple_payload), "Create Temple")
            if temple_res.status_code != 201:
                return
            temple_id = temple_res.json()["templeId"]
        else:
            log(f"Using existing temple ID: {temple_id}")

        # 3. Create Slot
        today = date.today().isoformat()
        slot_payload = {
            "templeId": temple_id,
            "date": today,
            "startTime": "10:00:00",
            "endTime": "11:00:00",
            "capacity": 100,
            "remaining": 100
        }
        
        # Check for existing slots
        log("Checking slots...")
        slots_res = requests.get(f"{BASE_URL}/slots/?templeId={temple_id}&date={today}")
        if slots_res.status_code != 200:
            log_response(slots_res, "Get Slots Failed")
            return

        slot_id = None
        slots_data = slots_res.json()
        if isinstance(slots_data, list):
            for s in slots_data:
                if s.get("startTime") == slot_payload["startTime"]:
                    slot_id = s["slotId"]
                    break
        else:
            log(f"Unexpected slots response format: {type(slots_data)}")
            log(slots_data)

        if not slot_id:
            log("Creating new slot...")
            slot_res = log_response(requests.post(f"{BASE_URL}/slots/", json=slot_payload), "Create Slot")
            if slot_res.status_code != 201:
                return
            slot_id = slot_res.json()["slotId"]
        else:
            log(f"Using existing slot ID: {slot_id}")

        # 4. Create Booking
        booking_payload = {
            "bookingType": "Darshan",
            "special": False,
            "bookingDate": today,
            "templeId": temple_id,
            "userId": user_id,
            "slotId": slot_id
        }
        
        log("Attempting to create booking...")
        booking_res = log_response(requests.post(f"{BASE_URL}/bookings/", json=booking_payload), "Create Booking")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"An error occurred: {e}")
