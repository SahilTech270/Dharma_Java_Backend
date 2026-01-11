from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.get_db import get_db
from database.models.booking.booking_model import Booking
from database.models.temple.temple_model import Temple
from database.schemas.booking.kiosk import KioskBookingCreate
from database.schemas.booking.booking_schema import BookingResponse
from database.dependencies import get_current_user
from database.models.admin.admin_model import Admin
from datetime import date

import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/bookings/kiosk",
    tags=["Kiosk Bookings"],
)

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_kiosk_booking(
    payload: KioskBookingCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 1. Verify Admin Access
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can perform kiosk bookings")
    
    admin = db.query(Admin).filter(Admin.adminId == current_user["id"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if not payload.templeId:
         raise HTTPException(status_code=400, detail="Temple ID is required for kiosk booking")

    temple = db.query(Temple).filter(Temple.templeId == payload.templeId).first()
    if not temple:
        raise HTTPException(status_code=404, detail="Temple not found")

    # Validate slot if provided
    if payload.slotId:
        from database.models.booking.slot_model import Slot
        slot = db.query(Slot).filter(Slot.slotId == payload.slotId).first()
        if not slot:
            raise HTTPException(status_code=404, detail="Slot not found")
        if slot.templeId != payload.templeId:
            raise HTTPException(status_code=400, detail="Slot does not belong to the specified temple")

    # 3. Create Booking
    new_booking = Booking(
        bookingType="OFFLINE", # Enforce OFFLINE type
        special=payload.special, # Use payload value (default False)
        templeId=payload.templeId,
        userId=None, # No user account for kiosk booking
        slotId=payload.slotId, # Assign provided slotId
        mobileNumber=payload.mobileNumber,
        numberOfParticipants=payload.numberOfParticipants,
        bookingDate=payload.bookingDate if payload.bookingDate else date.today()
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    sms_message = (
        f"Your Dharma kiosk booking is confirmed!\n"
        f"Booking ID: {new_booking.bookingId}\n"
        f"Temple: {temple.templeName}\n"
        f"Date: {new_booking.bookingDate.strftime('%d-%m-%Y')}\n"
        f"Slot ID: {new_booking.slotId}\n"
        f"No. of Participants: {new_booking.numberOfParticipants}\n"
        f"Thank you for visiting!"
    )

    # ------------------------------------------
    # ⭐ CALL TWILIO SERVICE THROUGH NGROK
    # ------------------------------------------
    try:
        sms_payload = {
            "mobile": payload.mobileNumber,
            "message": sms_message
        }
        url = os.getenv("URL")
        print(url)
        sms_response = requests.post(url, json=sms_payload)
        sms_response_json = sms_response.json()

        status_text = sms_response_json.get("status", "unknown")
        # print("Kiosk SMS Payload:", sms_payload)
        print("Kiosk SMS Response:", sms_response_json)
        print("Kiosk SMS Status:", status_text)

    except Exception as e:
        print("Kiosk SMS FAILED:", str(e))

    return new_booking