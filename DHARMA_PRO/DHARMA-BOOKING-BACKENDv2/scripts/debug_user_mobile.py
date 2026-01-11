import sys
import os

# Add parent dir to path to find app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.get_db import get_db
from database.models.booking.booking_model import Booking
from database.models.user.user_model import User
from sqlalchemy.orm import Session

from sqlalchemy import inspect

def check_user_mobile():
    with open("debug_result.txt", "w") as f:
        try:
            db_gen = get_db()
            db = next(db_gen)
            f.write("DB Connection established.\n")
            
            # Inspect columns
            inst = inspect(User)
            f.write(f"User mapped columns: {[c.key for c in inst.attrs]}\n")
            
            users = db.query(User).limit(5).all()
            f.write(f"Found {len(users)} users.\n")
            for u in users:
                f.write(f"ID: {u.userId}, StartName: {u.firstName}, Mobile: '{u.mobileNumber}'\n")
                
            db.close()
        except Exception as e:
            f.write(f"Error: {e}\n")
            import traceback
            traceback.print_exc(file=f)

if __name__ == "__main__":
    check_user_mobile()
