# database/booking_model.py
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey , func , DateTime
from sqlalchemy.orm import relationship

from database.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    bookingId = Column(Integer, primary_key=True, index=True, autoincrement=True)

    bookingType = Column(String(50), nullable=True)   # Virtual / Special
    special = Column(Boolean, default=True)           # auto from UI
    bookingDate = Column(DateTime,  default=func.current_date())
    
    # Kiosk / Offline Booking Fields
    mobileNumber = Column(String(15), nullable=True)
    numberOfParticipants = Column(Integer, nullable=True)
    

    # foreign keys
    templeId = Column(Integer, ForeignKey("temples.templeId"), nullable=True)
    userId = Column(Integer, ForeignKey("users.userId"), nullable=True)
    slotId = Column(Integer, ForeignKey("slots.slotId"), nullable=True)

    # relationships
    user = relationship("User", back_populates="bookings")
    temple = relationship("Temple", back_populates="bookings")
    slot = relationship("Slot", back_populates="bookings")

    
    

    participants = relationship(
        "BookingParticipant",
        back_populates="booking",
        cascade="all, delete-orphan",
    )

    payment = relationship(
        "Payment",
        back_populates="booking",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Booking(id={self.bookingId})>"
