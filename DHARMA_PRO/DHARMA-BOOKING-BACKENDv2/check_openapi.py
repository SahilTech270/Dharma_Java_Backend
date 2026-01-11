from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def check_openapi():
    try:
        response = client.get("/openapi.json")
        if response.status_code != 200:
            print(f"Failed to get openapi.json: {response.status_code}")
            return
            
        data = response.json()
        paths = data.get("paths", {})
        
        has_slots = any(p.startswith("/slots") for p in paths.keys())
        print(f"Contains /slots paths: {has_slots}")
        
        tags = set()
        for p, methods in paths.items():
            for m, details in methods.items():
                if "tags" in details:
                    tags.update(details["tags"])
                    
        print(f"Found tags: {tags}")
        
        if "Slots" in tags:
            print("Tag 'Slots' IS present in OpenAPI schema.")
        else:
            print("Tag 'Slots' IS NOT present in OpenAPI schema.")
            
    except Exception as e:
        print(f"Error checking OpenAPI: {e}")

if __name__ == "__main__":
    check_openapi()
