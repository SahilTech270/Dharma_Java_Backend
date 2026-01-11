import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import requests

BASE_URL = "http://localhost:8000"

def verify_admin_login():
    # 1. Create a test admin (if not exists) - reusing logic from verify_slot_capacity or just assuming testadmin exists from previous run
    # For robustness, let's try to login with the testadmin created earlier
    
    username = "testadmin@example.com" # This is the email
    password = "hashed_password" # Wait, we inserted 'hashed_password' directly into DB. 
    # The login endpoint verifies password using pwd_context.verify(plain, hashed).
    # If we inserted 'hashed_password' as the *hash*, then we need to know the *plain* text that hashes to it.
    # But we inserted a raw string 'hashed_password'. 
    # pwd_context.verify("somepass", "hashed_password") will fail because 'hashed_password' is not a valid hash format usually, or it won't match.
    
    # We need to insert a PROPERLY hashed password for a known plain password.
    
    from pwdlib import PasswordHash
    pwd_context = PasswordHash.recommended()
    plain_password = "password123"
    hashed_password = pwd_context.hash(plain_password)
    
    # Update the test admin with a real hash
    from sqlalchemy import create_engine, text
    from database.database import engine
    
    with engine.connect() as conn:
        conn.execute(text(f"UPDATE admins SET password = '{hashed_password}' WHERE email = '{username}'"))
        conn.commit()
        print(f"Updated admin {username} with valid hash.")

    # 2. Login
    print("Logging in as admin...")
    # OAuth2PasswordRequestForm expects form data: username, password
    login_data = {
        "username": username,
        "password": plain_password
    }
    
    resp = requests.post(f"{BASE_URL}/admin/auth/login", data=login_data)
    
    if resp.status_code != 200:
        print(f"Admin login failed: {resp.text}")
        return

    data = resp.json()
    token = data.get("access_token")
    if token:
        print("SUCCESS: Admin login successful, token received.")
        print(f"Token: {token[:20]}...")
    else:
        print("FAILURE: No token in response.")

if __name__ == "__main__":
    verify_admin_login()
