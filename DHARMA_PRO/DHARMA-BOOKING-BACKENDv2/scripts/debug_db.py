import sys
import os
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy import create_engine, inspect
from database.models.booking.slot_model import Slot
from database.database import Base

# Add current directory to path
sys.path.append(os.getcwd())

DATABASE_URL = "postgresql+psycopg2://postgres:0000@localhost:14000/booking"

def check_db():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    columns = inspector.get_columns('slots')
    print("DB Columns in 'slots' table:")
    for col in columns:
        print(f" - {col['name']} ({col['type']})")

    print("\nModel attributes in 'Slot' class:")
    for key, value in Slot.__dict__.items():
        if not key.startswith('_'):
            print(f" - {key}: {value}")

if __name__ == "__main__":
    check_db()
