import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import requests
import random
import string

BASE_URL = "http://localhost:8000"

def get_random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def verify_user_profile():
    # 1. Register a new user
    username = f"user_{get_random_string()}"
    email = f"{username}@example.com"
    password = "password123"
    
    register_payload = {
        "userName": username,
        "firstName": "Test",
        "lastName": "User",
        "mobileNumber": "1234567890",
        "email": email,
        "gender": "Male",
        "state": "Test State",
        "city": "Test City",
        "profilePhoto": "base64_image_string_simulation",
        "password": password
    }
    
    print(f"Registering user: {username}...")
    resp = requests.post(f"{BASE_URL}/users/register", json=register_payload)
    if resp.status_code != 200:
        print(f"Registration failed: {resp.text}")
        return

    # 2. Login to get token
    print("Logging in...")
    login_payload = {
        "identifier": username,
        "password": password
    }
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return
    
    data = resp.json()
    token = data.get("access_token")
    if not token:
        print("No access token returned!")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful, token received.")

    # 3. Get Profile
    print("Getting profile...")
    resp = requests.get(f"{BASE_URL}/users/me", headers=headers)
    if resp.status_code != 200:
        print(f"Get profile failed: {resp.text}")
        return
    
    profile = resp.json()
    print(f"Profile: {profile['userName']}, {profile['email']}")
    if profile.get('profilePhoto') != "base64_image_string_simulation":
        print(f"FAILURE: Profile photo mismatch. Got {profile.get('profilePhoto')}")
        return
    
    if profile['userName'] != username:
        print("FAILURE: Username mismatch")
        return

    # 4. Update Profile
    print("Updating profile...")
    update_payload = {
        "firstName": "Updated",
        "lastName": "Name",
        "profilePhoto": "updated_base64_image"
    }
    resp = requests.put(f"{BASE_URL}/users/me", json=update_payload, headers=headers)
    if resp.status_code != 200:
        print(f"Update profile failed: {resp.text}")
        return
    
    updated_profile = resp.json()
    print(f"Updated Profile: {updated_profile['firstName']} {updated_profile['lastName']}")
    if updated_profile.get('profilePhoto') != "updated_base64_image":
        print(f"FAILURE: Updated profile photo mismatch. Got {updated_profile.get('profilePhoto')}")
        return

    if updated_profile['firstName'] != "Updated":
        print("FAILURE: FirstName mismatch")
        return

    # 5. Delete Profile
    print("Deleting profile...")
    resp = requests.delete(f"{BASE_URL}/users/me", headers=headers)
    if resp.status_code != 204:
        print(f"Delete profile failed: {resp.text}")
        return
    print("Profile deleted.")

    # 6. Verify Deletion
    print("Verifying deletion...")
    resp = requests.get(f"{BASE_URL}/users/me", headers=headers)
    if resp.status_code == 404:
        print("SUCCESS: User not found (as expected)")
    else:
        print(f"FAILURE: Expected 404, got {resp.status_code}")

    # 7. Verify Admin Access Denial
    print("Verifying Admin Access Denial...")
    # Create admin token (mock or real if possible, here we mock for speed if we can import utils)
    from database.auth_utils import create_access_token
    admin_token = create_access_token({"sub": "admin@example.com", "id": 1, "role": "admin"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    resp = requests.get(f"{BASE_URL}/users/me", headers=admin_headers)
    if resp.status_code == 403:
        print("SUCCESS: Admin denied access (403)")
    else:
        print(f"FAILURE: Admin accessed user profile! Status: {resp.status_code}")

if __name__ == "__main__":
    verify_user_profile()
