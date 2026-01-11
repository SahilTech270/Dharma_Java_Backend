# app/schemas/payment_schema.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PaymentCreate(BaseModel):
    bookingId: int
    amount: float
    paymentMethod: str  # UPI / Card / NetBanking


class PaymentResponse(BaseModel):
    paymentId: int
    bookingId: int
    amount: float
    paymentMethod: str
    transactionId: Optional[str]
    paymentDate: Optional[datetime]
    paymentStatus: str

    class Config:
        from_attributes = True
