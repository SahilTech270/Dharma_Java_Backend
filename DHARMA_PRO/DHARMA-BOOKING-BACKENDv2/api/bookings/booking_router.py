# api/booking_router.py
from typing import List, Optional
from datetime import date as DateType

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.dependencies import get_current_user
from database.models.admin.admin_model import Admin

from database.models.booking.booking_model import Booking
from database.models.user.user_model import User
from database.models.temple.temple_model import Temple
from database.models.booking.slot_model import Slot
from database.schemas.booking.booking_schema import BookingCreate, BookingResponse
from database.get_db import get_db


import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):

    # --- Your validation logic ---
    user = db.query(User).filter(User.userId == payload.userId).first()
    if not user:
        raise HTTPException(404, "User not found for given userId")

    temple = db.query(Temple).filter(Temple.templeId == payload.templeId).first()
    if not temple:
        raise HTTPException(404, "Temple not found for given templeId")

    slot = None
    if payload.slotId is not None:
        slot = db.query(Slot).filter(Slot.slotId == payload.slotId).first()
        if not slot:
            raise HTTPException(404, "Slot not found for given slotId")
        if slot.templeId != payload.templeId:
            raise HTTPException(400, "Slot does not belong to the given temple")

    # --- Create booking ---
    user_mobile = user.mobileNumber
    print(f"DEBUG: Creating booking for User: {user.userId}, Mobile: {user_mobile}")

    new_booking = Booking(
        bookingType="ONLINE",
        special=payload.special,
        templeId=payload.templeId,
        userId=payload.userId,
        slotId=payload.slotId,
        bookingDate=payload.bookingDate,
        mobileNumber=user_mobile
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # ----------------------------------------------------
    # ⭐ PREPARE SMS
    # ----------------------------------------------------
    sms_message = (
    f"Dear {user.firstName}, your Dharma booking is confirmed!\n"
    f"Booking ID: {new_booking.bookingId}\n"
    f"Temple: {temple.templeName}\n"
    f"Date: {new_booking.bookingDate.strftime('%d-%m-%Y %H:%M')}\n"
    f"Slot ID: {new_booking.slotId}\n"
    f"Thank you for using Dharma."
    )

    # ----------------------------------------------------
    # ⭐ SEND SMS THROUGH NGROK → TWILIO SERVICE
    # ----------------------------------------------------

    try:
        send_data = {
            "mobile": user.mobileNumber,
            "message": sms_message  
        }

        URL=os.getenv("URL")
        sms_response = requests.post(URL, json=send_data)
        sms_response_json = sms_response.json()

        print("SMS Response:", sms_response_json)
        status_text = sms_response_json.get("status", "unknown")

    except Exception as e:
        status_text = f"FAILED: {str(e)}"
        print("SMS ERROR:", status_text)
    return new_booking


@router.get(
    "/",
    response_model=List[BookingResponse],
)
def get_all_bookings(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")

    admin = db.query(Admin).filter(Admin.adminId == user["id"]).first()

    if not admin:
        raise HTTPException(404, "Admin not found")


    bookings = db.query(Booking).all()
    return bookings


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
)
def get_booking_by_id(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.bookingId == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    return booking


@router.get(
    "/user/{user_id}",
    response_model=List[BookingResponse],
)
def get_bookings_by_user(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.userId == user_id).all()
    return bookings


@router.put(
    "/{booking_id}",
    response_model=BookingResponse,
)
def update_booking(
    booking_id: int,
    payload: BookingCreate,
    db: Session = Depends(get_db),
):
    """
    Full update: all fields from BookingCreate are required.
    """

    booking = db.query(Booking).filter(Booking.bookingId == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Ensure user exists
    user = db.query(User).filter(User.userId == payload.userId).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found for given userId",
        )

    # Ensure temple exists
    temple = db.query(Temple).filter(Temple.templeId == payload.templeId).first()
    if not temple:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Temple not found for given templeId",
        )

    # Validate slot if provided
    slot = None
    if payload.slotId is not None:
        slot = db.query(Slot).filter(Slot.id == payload.slotId).first()
        if not slot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Slot not found for given slotId",
            )
        if slot.templeId != payload.templeId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slot does not belong to the given templeId",
            )

    booking.bookingType = payload.bookingType
    booking.special = payload.special
    booking.templeId = payload.templeId
    booking.userId = payload.userId
    booking.slotId = payload.slotId

    if getattr(payload, "bookingDate", None) is not None:
        booking.bookingDate = payload.bookingDate

    db.commit()
    db.refresh(booking)

    return booking


@router.delete(
    "/{booking_id}",
    status_code=status.HTTP_200_OK,
)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    """
    Cancel a booking by ID.
    This affects only the booking, not the user.
    """

    booking = db.query(Booking).filter(Booking.bookingId == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    db.delete(booking)
    db.commit()

    return {"message": "Booking deleted (cancelled) successfully"}
