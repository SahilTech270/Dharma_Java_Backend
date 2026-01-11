from pydantic import BaseModel
from typing import Optional


class SlotBase(BaseModel):
    parkingId: int
    slotAvailability: bool
    status: bool = True
    slotCapacity: int


class SlotCreate(SlotBase):
    pass


class SlotUpdate(BaseModel):
    parkingId: Optional[int] = None
    slotAvailability: Optional[bool] = None
    status: Optional[bool] = None
    slotCapacity: Optional[int] = None


class SlotOut(SlotBase):
    slotId: int

    class Config:
        from_attributes = True
