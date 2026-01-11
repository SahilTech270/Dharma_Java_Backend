import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from database.database import engine
    with engine.connect() as conn:
        print("Database connection works")
except Exception as e:
    print(f"Database connection failed: {e}")
