# database/slot_schema.py
from datetime import date as DateType, time as TimeType, datetime
from typing import Optional
from pydantic import BaseModel, Field


class SlotBase(BaseModel):
    templeId: int
    date: DateType
    startTime: TimeType
    endTime: TimeType
    capacity: int = Field(gt=0)
    reservedOfflineTickets: int = 0
    remaining: Optional[int] = None


class SlotCreate(SlotBase):
    pass


class SlotUpdate(BaseModel):
    date: Optional[DateType] = None
    startTime: Optional[TimeType] = None
    endTime: Optional[TimeType] = None
    capacity: Optional[int] = None
    reservedOfflineTickets: Optional[int] = None
    remaining: Optional[int] = None


class SlotResponse(SlotBase):
    slotId: int
    onlineTickets: int
    createdAt: datetime

    class Config:
        # Pydantic v2 style (replaces orm_mode = True)
        from_attributes = True
