import os
import sys

# Mock imports to test logic without full DB
class MockBooking:
    bookingId = 1
    slotNo = "S-1"
    slot_time = "10:00 AM"
    booking_datetime = "2023-01-01 12:00:00"
    name = "Debug User"

class MockPayment:
    transactionId = "DEBUG_TXN_001"

try:
    print("Attempting to import ticket_service...")
    from api.payments.ticket_service import create_ticket_and_persist, _compose_ticket_image
    print("Import successful.")

    # 1. Test Image Composition directly
    print("\n--- Testing Image Composition ---")
    fields = {
        "id": "DBG123",
        "token": "tok123",
        "booking_datetime": "2023-01-01",
        "txn_id": "TXN999",
        "slot_no": "1",
        "slot_time": "10:00",
        "metadata": {"count": 1},
        "name": "Tester"
    }
    path = _compose_ticket_image(fields)
    print(f"Image created at: {path}")

    # 2. Test Full Service (requires DB session, so we skip persistence part or mock it)
    # We will just test the object attribute access part by mocking 
    print("\n--- Testing Attribute Extraction ---")
    b = MockBooking()
    p = MockPayment()
    
    # We won't call persistence because we don't have a DB session here easily
    # But checking if the logic throws before DB is key.
    
    print("Success! Script finished.")

except Exception as e:
    print(f"\n❌ EXCEPTION CAUGHT: {e}")
    import traceback
    traceback.print_exc()
