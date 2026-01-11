import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import requests
import sys

def test_login():
    url = "http://localhost:8005/auth/login"
    
    # Test Case 1: Login with email (as identifier)
    print("Test 1: Login with email")
    payload_email = {
        "identifier": "testuser123@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(url, json=payload_email)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

    print("-" * 20)

    # Test Case 2: Login with userName (as identifier)
    print("Test 2: Login with userName")
    payload_username = {
        "identifier": "testuser123",
        "password": "password123"
    }
    try:
        response = requests.post(url, json=payload_username)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
