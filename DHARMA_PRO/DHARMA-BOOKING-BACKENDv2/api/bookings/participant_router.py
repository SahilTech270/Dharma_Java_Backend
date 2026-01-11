from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.get_db import get_db
from database.models.booking.booking_participant_model import BookingParticipant
from database.schemas.booking.booking_participant_schema import (
    BookingParticipantCreate,
    BookingParticipantResponse,
)
from database.models.booking.booking_model import Booking

router = APIRouter(prefix="/participant", tags=["BookingParticipant"])


# ----------------------------
# Add Participant to Booking
# ----------------------------
@router.post(
    "/add",
    response_model=BookingParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_participant(payload: BookingParticipantCreate, db: Session = Depends(get_db)):

    # Ensure booking exists for given bookingId
    booking = db.query(Booking).filter(Booking.bookingId == payload.bookingId).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found for given bookingId",
        )

    participant = BookingParticipant(
        bookingId=payload.bookingId,
        participant_by_category=payload.participant_by_category,  # ✅ new field
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        photoIdType=payload.photoIdType,
        photoIdNumber=payload.photoIdNumber,
    )

    db.add(participant)
    db.commit()
    db.refresh(participant)

    return participant


# ----------------------------
# Get Participant by ID
# ----------------------------
@router.get(
    "/{participantId}",
    response_model=BookingParticipantResponse,
)
def get_participant(participantId: int, db: Session = Depends(get_db)):
    participant = (
        db.query(BookingParticipant)
        .filter(BookingParticipant.participantId == participantId)
        .first()
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found",
        )

    return participant


# ----------------------------
# Get All Participants for a Booking
# ----------------------------
@router.get(
    "/booking/{bookingId}",
    response_model=List[BookingParticipantResponse],
)
def get_participants_for_booking(bookingId: int, db: Session = Depends(get_db)):

    # Optional: check if booking exists
    booking = db.query(Booking).filter(Booking.bookingId == bookingId).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    participants = (
        db.query(BookingParticipant)
        .filter(BookingParticipant.bookingId == bookingId)
        .all()
    )

    return participants


# ----------------------------
# Update Participant (full update)
# ----------------------------
@router.put(
    "/{participantId}",
    response_model=BookingParticipantResponse,
)
def update_participant(
    participantId: int,
    payload: BookingParticipantCreate,
    db: Session = Depends(get_db),
):
    participant = (
        db.query(BookingParticipant)
        .filter(BookingParticipant.participantId == participantId)
        .first()
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found",
        )

    # ensure booking exists if bookingId is changed
    booking = db.query(Booking).filter(Booking.bookingId == payload.bookingId).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found for given bookingId",
        )

    participant.bookingId = payload.bookingId
    participant.participant_by_category = payload.participant_by_category  # ✅ new field
    participant.name = payload.name
    participant.age = payload.age
    participant.gender = payload.gender
    participant.photoIdType = payload.photoIdType
    participant.photoIdNumber = payload.photoIdNumber

    db.commit()
    db.refresh(participant)

    return participant


# ----------------------------
# Delete Participant
# ----------------------------
@router.delete(
    "/{participantId}",
    status_code=status.HTTP_200_OK,
)
def delete_participant(participantId: int, db: Session = Depends(get_db)):
    participant = (
        db.query(BookingParticipant)
        .filter(BookingParticipant.participantId == participantId)
        .first()
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found",
        )

    db.delete(participant)
    db.commit()

    return {"message": "Participant deleted successfully"}
