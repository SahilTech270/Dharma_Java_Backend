import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import sys
import os

print("Starting debug script...")

try:
    print("Importing database...")
    from database.database import engine, Base
    print("Database imported.")

    print("Importing main...")
    from main import app
    print("Main imported.")
    
except Exception as e:
    print(f"CAUGHT EXCEPTION: {e}")
    import traceback
    traceback.print_exc()
