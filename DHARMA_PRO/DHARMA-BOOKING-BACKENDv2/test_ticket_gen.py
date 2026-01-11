import sys
import os

# Mock environment
os.environ["BASE_URL"] = "http://localhost:8000"

try:
    from api.payments.ticket_service import _compose_ticket_image
    print("Import successful")
except ImportError as e:
    print(f"Import failed: {e}")
    sys.exit(1)

def test_gen():
    dummy_fields = {
        "id": "123456",
        "token": "abcdef",
        "booking_datetime": "2023-10-27 10:00:00",
        "txn_id": "TXN_TEST_999",
        "slot_no": "SLOT-5",
        "slot_time": "10:00 AM - 11:00 AM",
        "metadata": {"count": 2},
        "name": "John Doe"
    }
    
    try:
        path = _compose_ticket_image(dummy_fields)
        print(f"Success! Image generated at: {path}")
        
    except Exception as e:
        print(f"Error generating image: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gen()
