from pydantic import BaseModel
from typing import Optional

class ParkingBase(BaseModel):
    templeId: int
    totalSlots: int = 0
    freeSlots: int = 0
    filledSlots: int = 0
    twoWheeler: int = 0
    fourWheeler: int = 0
    cctvCount: int = 0
    status: bool = True


class ParkingCreate(ParkingBase):
    pass


class ParkingUpdate(BaseModel):
    totalSlots: Optional[int] = None
    freeSlots: Optional[int] = None
    filledSlots: Optional[int] = None
    twoWheeler: Optional[int] = None
    fourWheeler: Optional[int] = None
    cctvCount: Optional[int] = None
    status: Optional[bool] = None


class ParkingOut(ParkingBase):
    parkingId: int

    class Config:
        from_attributes = True