# api/payments/ticket_service.py
import os
import uuid
import json
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import qrcode

from typing import Dict, Any
from sqlalchemy.orm import Session
from database.models.common.ticket_model import Ticket

# Config — adjust to your environment
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173") # Default to local Vite

TEMPLATE_PATH = os.path.join("static", "template_ticket_v2.jpg")   # put your sample image here
OUT_DIR = os.path.join("static", "tickets")
os.makedirs(OUT_DIR, exist_ok=True)

# Helpers
def _generate_qr_bytes(data: str, size: int = 300) -> BytesIO:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    img = img.resize((size, size))
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf

def _compose_ticket_image(ticket_fields: Dict[str, Any]) -> str:
    """
    Draws QR on top of TEMPLATE_PATH and saves PNG to OUT_DIR.
    Returns relative image path (e.g. static/tickets/<filename>.png)
    """
    if not os.path.exists(TEMPLATE_PATH):
        raise RuntimeError(f"Template not found at {TEMPLATE_PATH}. Place your template image there.")

    base = Image.open(TEMPLATE_PATH).convert("RGBA")
    # W, H = base.size # Unused now
    
    # defensive extraction with defaults
    booking_no = ticket_fields.get("id") or ""
    
    # QR Code centered in the box
    # Box Center: (512, 567)
    # Target QR Size: 520
    # Top Left: (252, 307)

    # UPDATED: Point QR to Frontend URL so scanning opens the app
    qr_url = f"{FRONTEND_URL}/ticket/{booking_no}?t={ticket_fields.get('token')}"
    
    qr_size = 520
    qr_buf = _generate_qr_bytes(qr_url, size=qr_size)
    qr_img = Image.open(qr_buf).convert("RGBA")
    
    qr_x = 252
    qr_y = 307
    base.paste(qr_img, (qr_x, qr_y), qr_img)
    
    # Save
    filename = f"{booking_no}.png"
    outpath = os.path.join(OUT_DIR, filename)
    base.convert("RGB").save(outpath, "PNG", quality=95)
    return os.path.join("static", "tickets", filename)

def create_ticket_and_persist(db: Session, *, booking_obj, payment_obj=None, extra: Dict[str,Any]=None) -> Dict[str,Any]:
    """
    Create ticket row, generate image and return info dict.
    booking_obj: SQLAlchemy Booking instance (we read slot/time/name from it)
    payment_obj: Payment instance (for txn_id)
    extra: optional dict for metadata like count
    """
    ticket_id = (str(uuid.uuid4())[:12]).upper()
    token = uuid.uuid4().hex
    txn_id = getattr(payment_obj, "transactionId", None) or getattr(payment_obj, "transaction_id", None) or ""

    # --- Extract Details from Booking Relationship ---
    # 1. Slot Details
    slot_obj = getattr(booking_obj, "slot", None)
    if slot_obj:
        slot_no = str(getattr(slot_obj, "slotNumber", ""))
        # Format time if it's a time object
        t = getattr(slot_obj, "startTime", "")
        slot_time = str(t) if t else ""
    else:
        # Fallback to direct attrs (e.g. if flat object)
        slot_no = getattr(booking_obj, "slotNo", None) or getattr(booking_obj, "slot_no", "")
        slot_time = getattr(booking_obj, "slotTime", "") or getattr(booking_obj, "slot_time", "")

    # 2. Booking Date / Created At
    booking_dt = getattr(booking_obj, "bookingDate", None) or getattr(booking_obj, "booking_datetime", None) or getattr(booking_obj, "created_at", "")
    
    # 3. User Name / Temple / Participants
    user_obj = getattr(booking_obj, "user", None)
    name = getattr(booking_obj, "name", "")
    if not name and user_obj:
        name = getattr(user_obj, "name", "") or getattr(user_obj, "username", "") or getattr(user_obj, "email", "")
    
    temple_obj = getattr(booking_obj, "temple", None)
    temple_name = getattr(temple_obj, "templeName", "") or getattr(temple_obj, "name", "Dharma Temple")
    location = getattr(temple_obj, "location", "India")

    # Fetch participants from relationship
    participants = getattr(booking_obj, "participants", [])
    participant_count = len(participants) if participants else 1
    
    p_names = [getattr(p, "name", "Devotee") for p in participants]
    participant_names_str = ", ".join(p_names)
    if not participant_names_str:
        participant_names_str = name  # fallback to booker name if no participants found

    # Ensure all are strings
    slot_no = str(slot_no) if slot_no else ""
    slot_time = str(slot_time) if slot_time else ""
    booking_dt = str(booking_dt) if booking_dt else ""
    name = str(name) if name else "Devotee"

    metadata = extra or {}
    metadata["count"] = participant_count 
    metadata["participant_names"] = participant_names_str

    # image composition fields
    fields = {
        "id": ticket_id,
        "token": token,
        "booking_datetime": booking_dt,
        "txn_id": txn_id,
        "slot_no": slot_no,
        "slot_time": slot_time,
        "metadata": metadata,
        "name": name,
        "temple_name": temple_name,
        "location": location
    }

    image_path = _compose_ticket_image(fields)

    # persist ticket row
    db_ticket = Ticket(
        id=ticket_id,
        token=token,
        booking_id=getattr(booking_obj, "bookingId", None) or getattr(booking_obj, "id", None),
        user_id=getattr(booking_obj, "userId", None) or None,
        txn_id=txn_id,
        slot_no=slot_no,
        slot_time=slot_time,
        booking_datetime=booking_dt,
        image_path=image_path,
        metadata_json=json.dumps(metadata),   # <<-- use metadata_json (not reserved 'metadata')
    )
    db.add(db_ticket)
    db.commit()

    ticket_url = f"{BASE_URL}/ticket/{ticket_id}?t={token}"
    image_url = f"{BASE_URL}/{image_path}"

    return {"ticket_id": ticket_id, "ticket_url": ticket_url, "image_url": image_url, "txn_id": txn_id}
