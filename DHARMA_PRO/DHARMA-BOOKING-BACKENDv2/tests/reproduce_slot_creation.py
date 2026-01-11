import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import requests
import datetime

BASE_URL = "http://127.0.0.1:8000"

def test_create_slot():
    # 1. Get a temple
    print("Fetching temples...")
    try:
        response = requests.get(f"{BASE_URL}/temples/")
        if response.status_code != 200:
            print(f"Failed to fetch temples: {response.text}")
            return
        
        temples = response.json()
        if not temples:
            print("No temples found. Please create a temple first.")
            # Create a dummy temple for testing
            print("Creating a dummy temple...")
            temple_data = {
                "templeName": "Test Temple " + str(datetime.datetime.now().timestamp()),
                "location": "Test Location"
            }
            response = requests.post(f"{BASE_URL}/temples/", json=temple_data)
            if response.status_code != 200:
                print(f"Failed to create temple: {response.text}")
                return
            temple_id = response.json()["templeId"]
            print(f"Created temple with ID: {temple_id}")
        else:
            temple_id = temples[0]["templeId"]
            print(f"Using temple ID: {temple_id}")

        # 2. Create a slot
        print("Creating a slot...")
        today = datetime.date.today().isoformat()
        slot_data = {
            "templeId": temple_id,
            "date": today,
            "startTime": "10:00:00",
            "endTime": "11:00:00",
            "capacity": 20
        }
        
        response = requests.post(f"{BASE_URL}/slots/", json=slot_data)
        if response.status_code == 201:
            print("Slot created successfully!")
            print(response.json())
        else:
            print(f"Failed to create slot: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_create_slot()
