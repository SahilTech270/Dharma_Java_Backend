import requests

try:
    # Try to hit the slots endpoint (will likely fail auth, but 403/401 means it exists)
    # If it returns 404, it's missing.
    resp = requests.get("http://localhost:8000/slots/")
    print(f"Status Code: {resp.status_code}")
    if resp.status_code != 404:
        print("Slot API is reachable!")
    else:
        print("Slot API returned 404 (Not Found)")
        
except Exception as e:
    print(f"Connection failed: {e}")
