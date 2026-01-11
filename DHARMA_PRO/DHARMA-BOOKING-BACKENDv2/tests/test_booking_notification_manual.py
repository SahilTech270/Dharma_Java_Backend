import requests
from database.get_db import get_db
from database.models.user.user_model import User
from database.models.temple.temple_model import Temple
from database.models.booking.booking_model import Booking
from database.models.booking.slot_model import Slot
from database.models.parking.parking_model import ParkingZone
from database.models.booking.booking_participant_model import BookingParticipant
from database.models.payment.payment_model import Payment
from database.models.parking.parking_slot_model import ParkingSlots
from database.database import SessionLocal
import datetime

def test_create_booking():
    db = SessionLocal()

    with open("test_notification_manual.log", "w") as f:
        try:
            # Get a valid user
            user = db.query(User).first()
            if not user:
                f.write("FAILURE: No users found in DB.")
                return

            # Get a valid temple
            temple = db.query(Temple).first()
            if not temple:
                f.write("FAILURE: No temples found in DB.")
                return

            f.write(f"Testing with User: {user.userId} and Temple: {temple.templeId}\n")

            # Prepare payload
            payload = {
                "bookingType": "ONLINE",
                "special": False,
                "bookingDate": str(datetime.date.today()),
                "templeId": temple.templeId,
                "userId": user.userId,
                "slotId": None
            }

            # Send request
            url = "http://127.0.0.1:8000/bookings/"
            f.write(f"Sending POST to {url} with payload: {payload}\n")
            
            response = requests.post(url, json=payload)
            
            f.write(f"Status Code: {response.status_code}\n")
            f.write(f"Response Body: {response.text}\n")
            
            if response.status_code == 201:
                f.write("SUCCESS: Booking created successfully. Notification logic should have triggered.\n")
            else:
                f.write("FAILURE: Failed to create booking.\n")

        except Exception as e:
            f.write(f"ERROR: {e}\n")
        finally:
            db.close()


if __name__ == "__main__":
    test_create_booking()
