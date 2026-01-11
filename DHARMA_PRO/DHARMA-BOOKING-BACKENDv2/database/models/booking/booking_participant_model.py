from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.database import Base

class BookingParticipant(Base):
    __tablename__ = "booking_participants"

    participantId = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bookingId = Column(Integer, ForeignKey("bookings.bookingId"), nullable=False)
    
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    photoIdType = Column(String, nullable=True)
    photoIdNumber = Column(String, nullable=True)
    participant_by_category = Column(String, nullable=True)

    # Relationship
    booking = relationship("Booking", back_populates="participants")
