import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import requests
import datetime
from database.auth_utils import create_access_token

BASE_URL = "http://localhost:8000"

from sqlalchemy import create_engine, text
from database.database import engine

def create_test_admin():
    with engine.connect() as conn:
        # Check if admin exists
        result = conn.execute(text("SELECT \"adminId\" FROM admins WHERE email = 'testadmin@example.com'"))
        admin = result.fetchone()
        if admin:
            return admin[0]
        
        # Create admin
        result = conn.execute(text("INSERT INTO admins (\"adminName\", email, password) VALUES ('Test Admin', 'testadmin@example.com', 'hashed_password') RETURNING \"adminId\""))
        admin_id = result.fetchone()[0]
        conn.commit()
        return admin_id

def get_admin_token():
    admin_id = create_test_admin()
    token = create_access_token({"sub": "testadmin@example.com", "id": admin_id, "role": "admin"})
    return token

def test_slot_capacity():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create a temple (if needed) or use existing
    # Let's assume templeId 1 exists or create one
    temple_payload = {
        "templeName": "Test Temple Capacity",
        "location": "Test Location",
        "description": "Test Description",
        "images": []
    }
    # Try to create temple, ignore if fails (might already exist)
    try:
        requests.post(f"{BASE_URL}/temples/", json=temple_payload, headers=headers)
    except:
        pass

    # 2. Create a slot with reservedOfflineTickets
    today = datetime.date.today().isoformat()
    start_time = (datetime.datetime.now() + datetime.timedelta(minutes=5)).strftime("%H:%M:%S")
    end_time = (datetime.datetime.now() + datetime.timedelta(minutes=65)).strftime("%H:%M:%S")
    
    payload = {
        "templeId": 1,
        "date": today,
        "startTime": start_time,
        "endTime": end_time,
        "capacity": 100,
        "reservedOfflineTickets": 20
    }
    
    print(f"Creating slot with capacity=100, reserved=20...")
    response = requests.post(f"{BASE_URL}/slots/", json=payload, headers=headers)
    
    if response.status_code != 201:
        print(f"Failed to create slot: {response.text}")
        return

    slot = response.json()
    print(f"Slot created: {slot}")
    
    # Verify onlineTickets
    # Note: onlineTickets might not be in response if we didn't add it to SlotResponse properly or if Pydantic didn't pick it up
    # But we added it to SlotResponse
    if slot.get("onlineTickets") == 80:
        print("SUCCESS: onlineTickets is 80 (100 - 20)")
    else:
        print(f"FAILURE: onlineTickets is {slot.get('onlineTickets')}, expected 80")

    slot_id = slot["slotId"]

    # 3. Update reservedOfflineTickets
    print("Updating reservedOfflineTickets to 50...")
    update_payload = {
        "reservedOfflineTickets": 50
    }
    response = requests.put(f"{BASE_URL}/slots/{slot_id}", json=update_payload, headers=headers)
    
    if response.status_code != 200:
        print(f"Failed to update slot: {response.text}")
        return

    updated_slot = response.json()
    print(f"Updated slot: {updated_slot}")
    
    if updated_slot.get("onlineTickets") == 50:
        print("SUCCESS: onlineTickets is 50 (100 - 50)")
    else:
        print(f"FAILURE: onlineTickets is {updated_slot.get('onlineTickets')}, expected 50")

    # 4. Cleanup
    requests.delete(f"{BASE_URL}/slots/{slot_id}", headers=headers)
    print("Slot deleted.")

if __name__ == "__main__":
    test_slot_capacity()
