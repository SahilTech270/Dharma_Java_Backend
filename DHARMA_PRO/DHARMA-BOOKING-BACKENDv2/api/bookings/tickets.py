# api/bookings/tickets.py

import json
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session, joinedload

from database.get_db import get_db
from database.models.common.ticket_model import Ticket
from database.models.booking.booking_model import Booking
from database.models.temple.temple_model import Temple
from database.models.booking.slot_model import Slot
from database.models.booking.booking_participant_model import BookingParticipant

router = APIRouter(prefix="/ticket", tags=["Ticket"])
templates = Jinja2Templates(directory="templates")


@router.get("/{ticket_id}")
def view_ticket(request: Request, ticket_id: str, t: str = "", db: Session = Depends(get_db)):
    # 1. Verify Ticket Token
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if t != ticket.token:
        raise HTTPException(status_code=403, detail="Invalid token")

    # 2. Deep Fetch Booking Data (Live from DB)
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.temple),
            joinedload(Booking.slot),
            joinedload(Booking.participants),
            joinedload(Booking.user)
        )
        .filter(Booking.bookingId == ticket.booking_id)
        .first()
    )

    # 3. Extract Live Data
    if not booking:
        # Fallback: if booking deleted, try to render from stored metadata
        return _render_with_fallback(request, ticket)

    # --- Live Temple Info ---
    temple_name = getattr(booking.temple, "templeName", "Dharma Temple") if booking.temple else "Dharma Temple"
    # Some temple models use 'location', some might not. Adjust as per your model.
    location = getattr(booking.temple, "location", "India") if booking.temple else "India"

    # --- Live Slot Info ---
    if booking.slot:
        slot_no = str(booking.slot.slotNumber)
        slot_time = str(booking.slot.startTime)
    else:
        # Fallback to ticket snapshot
        slot_no = ticket.slot_no or "N/A"
        slot_time = ticket.slot_time or ""

    # --- Live Participants Info ---
    participants = booking.participants
    participant_count = len(participants) if participants else 1
    
    # Extract full details for "See More"
    participants_list = [
        {
            "name": p.name, 
            "age": p.age, 
            "gender": p.gender,
            "id_type": getattr(p, "photoIdType", "N/A"),
            "id_no": getattr(p, "photoIdNumber", "N/A")
        } 
        for p in participants
    ]
    
    # Extract names for summary
    p_names = [p.name for p in participants]
    
    # Primary Name (User or First Participant)
    primary_name = getattr(booking.user, "name", "") 
    if not primary_name and participants:
        primary_name = participants[0].name
    if not primary_name:
        primary_name = "Devotee"

    participant_names_str = ", ".join(p_names)
    if not participant_names_str:
        participant_names_str = primary_name

    # 4. Construct Full Dictionary
    ticket_dict = {
        "id": ticket.id,
        "booking_id": booking.bookingId,
        "txn_id": ticket.txn_id or "N/A",  
        "slot_no": slot_no,
        "slot_time": slot_time,
        "booking_datetime": str(booking.bookingDate), # Ensure string for JSON
        
        # New Deep Fields
        "temple_name": temple_name,
        "location": location,
        "name": primary_name,
        "participant_count": participant_count,
        "participant_names": participant_names_str,
        "participants_details": participants_list,  # <--- New Field
        
        "image_url": f"/{ticket.image_path}" if ticket.image_path else None,
    }

    # Return JSON directly used by frontend
    return ticket_dict

def _render_with_fallback(request, ticket):
    """Render utilizing only the JSON metadata stored in the Ticket row (Snapshot mode)"""
    try:
        md = json.loads(ticket.metadata_json or "{}")
    except:
        md = {}

    t_dict = {
        "id": ticket.id,
        "txn_id": ticket.txn_id or "N/A",
        "booking_datetime": str(ticket.booking_datetime),
        "slot_no": ticket.slot_no,
        "slot_time": ticket.slot_time,
        "temple_name": md.get("temple_name", "Dharma Temple"),
        "location": md.get("location", "India"),
        "name": md.get("name", "Devotee"),
        "participant_count": md.get("count", 1),
        "participant_names": md.get("participant_names", "Devotee"),
        "image_url": f"/{ticket.image_path}" if ticket.image_path else None,
        "is_fallback": True
    }
    return t_dict
