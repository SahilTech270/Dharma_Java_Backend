from pydantic import BaseModel
from typing import Optional, Dict, Any

class TicketCreateResponse(BaseModel):
    ticket_id: str
    ticket_url: str
    image_url: str
    txn_id: Optional[str]

class TicketOut(BaseModel):
    id: str
    booking_id: Optional[int]
    txn_id: Optional[str]
    slot_no: Optional[str]
    slot_time: Optional[str]
    booking_datetime: Optional[str]
    image_path: Optional[str]
    metadata: Optional[Dict[str, Any]]

    class Config:
        orm_mode = True
