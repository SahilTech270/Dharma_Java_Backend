from main import app
import json

print("=== All Routes with Tags ===\n")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'tags'):
        tags = route.tags if route.tags else []
        if tags:  # Only show routes with tags
            methods = sorted(list(getattr(route, 'methods', set())))
            print(f"Path: {route.path}")
            print(f"  Methods: {methods}")
            print(f"  Tags: {tags}")
            print()

print("\n=== Routes specifically tagged 'Slots' ===\n")
for route in app.routes:
    if hasattr(route, 'tags') and route.tags and 'Slots' in route.tags:
        path = getattr(route, 'path', 'N/A')
        methods = sorted(list(getattr(route, 'methods', set())))
        print(f"{path} - {methods}")
