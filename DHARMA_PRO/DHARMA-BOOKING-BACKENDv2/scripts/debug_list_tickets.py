import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from database.models.common.ticket_model import Ticket

def list_tickets():
    db = SessionLocal()
    try:
        tickets = db.query(Ticket).all()
        print(f"Total Tickets Found: {len(tickets)}")
        for t in tickets:
            print(f"ID: {t.id} | Token: {t.token} | Name: {t.id} | Image: {t.image_path}")
            
    except Exception as e:
        print(f"Error querying tickets: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_tickets()
