from typing import Optional
from pydantic import BaseModel
from datetime import date

class KioskBookingCreate(BaseModel):
    mobileNumber: str
    numberOfParticipants: int
    special: bool = False
    templeId: Optional[int] = None
    slotId: Optional[int] = None
    bookingDate: Optional[date] = None
    bookingType: str = "OFFLINE"

    class Config:
        from_attributes = True
