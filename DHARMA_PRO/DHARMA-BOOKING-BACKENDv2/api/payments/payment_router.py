from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from database.get_db import get_db
from database.models.payment.payment_model import Payment
from database.models.booking.booking_model import Booking
from database.schemas.payment.payment_schema import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/payment", tags=["Payment"])



# ---------------------------------------------------------
# Create Payment (initial pending record)
# ---------------------------------------------------------
@router.post("/create", response_model=PaymentResponse)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):

    booking = db.query(Booking).filter(Booking.bookingId == payload.bookingId).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    payment = Payment(
        bookingId=payload.bookingId,
        amount=payload.amount,
        paymentMethod=payload.paymentMethod,
        paymentStatus="pending",
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment



# ---------------------------------------------------------
# Webhook Payload
# ---------------------------------------------------------
class WebhookPayload(BaseModel):
    our_payment_id: int
    gateway_txn_id: str
    status: str     # SUCCESS or FAILED



# ---------------------------------------------------------
# Webhook Handler (Payment Gateway -> Your Backend)
# ---------------------------------------------------------
@router.post("/webhook")
async def gateway_webhook(
    payload: WebhookPayload,
    db: Session = Depends(get_db),
    x_gateway_sig: str | None = Header(None),   # optional validation header
):

    # Fetch payment row
    payment = (
        db.query(Payment)
        .filter(Payment.paymentId == payload.our_payment_id)
        .first()
    )

    if not payment:
        raise HTTPException(404, "Payment record not found")

    # Idempotency: don't regenerate ticket
    if payment.paymentStatus == "confirmed" and payload.status == "SUCCESS":
        return {"ok": True, "message": "Already confirmed"}

    # ---------------------------------------------
    # SUCCESS CASE
    # ---------------------------------------------
    if payload.status == "SUCCESS":

        payment.paymentStatus = "confirmed"
        payment.transactionId = payload.gateway_txn_id
        payment.paymentDate = datetime.now()
        db.commit()   # Save payment status BEFORE ticket creation

        # Fetch associated booking
        booking = db.query(Booking).filter(Booking.bookingId == payment.bookingId).first()

        # Generate Ticket
        try:
            from api.payments.ticket_service import create_ticket_and_persist
            ticket_info = create_ticket_and_persist(
                db=db,
                booking_obj=booking,
                payment_obj=payment,
                extra={"count": 1}  # adjust count if needed
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            print("❌ Ticket generation failed:", e)
            ticket_info = None
            error_msg = str(e)

        return {
            "ok": True, 
            "paymentStatus": "confirmed", 
            "ticket": ticket_info,
            "error": error_msg if not ticket_info else None,
            "ticket_url": ticket_info.get("ticket_url") if ticket_info else None,
            "image_url": ticket_info.get("image_url") if ticket_info else None
        }


    # ---------------------------------------------
    # FAILED CASE
    # ---------------------------------------------
    else:
        payment.paymentStatus = "cancelled"
        payment.transactionId = payload.gateway_txn_id
        db.commit()

        return {"ok": True, "paymentStatus": "cancelled"}

    

# ---------------------------------------------------------
# Get Payment By ID
# ---------------------------------------------------------
@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    p = db.query(Payment).filter(Payment.paymentId == payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    return p
