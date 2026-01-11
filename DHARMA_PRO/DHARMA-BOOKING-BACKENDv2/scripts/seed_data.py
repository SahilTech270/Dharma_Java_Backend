from database.database import SessionLocal
from database.models.user.user_model import User
from database.models.temple.temple_model import Temple
from database.models.booking.slot_model import Slot
from database.models.parking.parking_model import ParkingZone
from database.models.booking.booking_model import Booking
from database.models.payment.payment_model import Payment
from database.models.booking.booking_participant_model import BookingParticipant
from database.models.parking.parking_slot_model import ParkingSlots
from database.models.admin.admin_model import Admin
from database.models.common.sms_model import SMSLog
# Ensure all models are imported to avoid mapper errors?
# Usually imports in models are enough, but we should be safe.
import datetime

def seed_data():
    db = SessionLocal()
    try:
        # Check if user exists
        if not db.query(User).first():
            print("Seeding User...")
            user = User(
                userName="testuser",
                firstName="Test",
                lastName="User",
                mobileNumber="9876543210", # Valid number format
                email="test@example.com",
                password="hashedpassword",
                gender="Male",
                state="TestState",
                city="TestCity"
            )
            db.add(user)
        
        # Check if temple exists
        if not db.query(Temple).first():
            print("Seeding Temple...")
            temple = Temple(
                templeName="Test Temple",
                location="Test Location"
            )
            db.add(temple)
        
        db.commit()
        print("Seeding completed successfully.")

    except Exception as e:
        print(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
