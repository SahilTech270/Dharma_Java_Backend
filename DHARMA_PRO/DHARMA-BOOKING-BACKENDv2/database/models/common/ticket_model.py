from sqlalchemy import Column, String, Integer, DateTime, Text, func, ForeignKey
from database.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String(64), primary_key=True, index=True)        # e.g. short uuid
    token = Column(String(128), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.bookingId"), nullable=True)
    user_id = Column(Integer, nullable=True)
    txn_id = Column(String(256), nullable=True)
    slot_no = Column(String(128), nullable=True)
    slot_time = Column(String(128), nullable=True)
    booking_datetime = Column(String(128), nullable=True)
    image_path = Column(String(512), nullable=True)
    metadata_json = Column(Text, nullable=True)      # <- renamed, store JSON string here
    created_at = Column(DateTime, server_default=func.now())
