from typing import Optional
from pydantic import BaseModel


class BookingParticipantCreate(BaseModel):
    bookingId: int
    name: str
    age: int
    gender: str
    photoIdType: str
    photoIdNumber: str
    participant_by_category: Optional[str] = None


    class Config:
        from_attributes = True


class BookingParticipantResponse(BaseModel):
    participantId: int
    bookingId: int
    name: str
    age: int
    gender: str
    photoIdType: str
    photoIdNumber: str
    participant_by_category: Optional[str] = None


    class Config:
        from_attributes = True
