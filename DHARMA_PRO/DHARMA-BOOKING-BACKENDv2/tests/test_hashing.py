import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api.user_authentication.user_registration import hash_password

try:
    pwd = "password123"
    print(f"Testing hash with: {pwd}")
    hashed = hash_password(pwd)
    print(f"Success: {hashed}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
