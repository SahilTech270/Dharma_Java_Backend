from main import app

print("=== Registered Routes ===")
for route in app.routes:
    if hasattr(route, 'path'):
        methods = getattr(route, 'methods', set())
        print(f"{route.path} - {methods}")

print("\n=== Registered Tags ===")
tags_seen = set()
for route in app.routes:
    if hasattr(route, 'tags'):
        for tag in route.tags or []:
            tags_seen.add(tag)

for tag in sorted(tags_seen):
    print(f"  - {tag}")
