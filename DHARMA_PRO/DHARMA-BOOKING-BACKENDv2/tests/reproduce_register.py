import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import requests
import sys

def test_register():
    url = "http://localhost:8003/users/register"
    payload = {
        "userName": "testuser123",
        "firstName": "Test",
        "lastName": "User",
        "mobileNumber": "1234567890",
        "email": "testuser123@example.com",
        "gender": "Male",
        "state": "TestState",
        "city": "TestCity",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
