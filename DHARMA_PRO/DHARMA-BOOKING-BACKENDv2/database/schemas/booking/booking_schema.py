from typing import Optional
from pydantic import BaseModel
from datetime import date


class BookingCreate(BaseModel):
    bookingType: Optional[str] = "ONLINE"
    special: bool
    bookingDate: date
    templeId: int
    userId: int
    slotId: Optional[int] = None


    class Config:
        from_attributes = True


class BookingResponse(BaseModel):
    bookingId: int
    bookingType: str
    special: bool
    bookingDate: date
    templeId: int
    userId: Optional[int] = None
    slotId: Optional[int] = None

    class Config:
        from_attributes = True
