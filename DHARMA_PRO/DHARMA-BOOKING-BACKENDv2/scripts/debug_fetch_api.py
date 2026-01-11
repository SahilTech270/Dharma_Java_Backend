import requests
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.database import SessionLocal
from database.models.common.ticket_model import Ticket

def test_fetch():
    db = SessionLocal()
    ticket = db.query(Ticket).first()
    if not ticket:
        print("No tickets found in DB.")
        return

    print(f"Testing Ticket ID: {ticket.id}")
    print(f"Token: {ticket.token}")
    
    url = f"http://localhost:8000/ticket/{ticket.id}?t={ticket.token}"
    print(f"URL: {url}")
    
    try:
        resp = requests.get(url)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_fetch()
