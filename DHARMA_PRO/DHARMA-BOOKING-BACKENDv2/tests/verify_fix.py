import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy import create_engine, text
from database.auth_utils import create_access_token
from dotenv import load_dotenv

# Load env vars
load_dotenv()

def verify():
    print("Verifying fixes...")
    
    # 1. Verify DB Connection
    url = os.getenv("DATABASE_URL")
    print(f"Database URL: {url}")
    
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Database connection successful!")
    except Exception as e:
        print(f"Database connection FAILED: {e}")

    # 2. Verify Token Generation
    try:
        token = create_access_token({"sub": "test_admin"})
        print(f"Token generation successful: {token[:20]}...")
    except Exception as e:
        print(f"Token generation FAILED: {e}")

if __name__ == "__main__":
    verify()
