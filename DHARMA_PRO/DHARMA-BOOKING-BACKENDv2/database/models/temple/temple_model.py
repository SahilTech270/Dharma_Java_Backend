from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database.database import Base

class Temple(Base):
    __tablename__ = "temples"

    templeId = Column(Integer, primary_key=True, index=True, autoincrement=True)
    templeName = Column(String(150), nullable=True)
    location = Column(String(200), nullable=True)

    bookings = relationship(
        "Booking",
        back_populates="temple",
        cascade="all, delete-orphan"
    )

    slots = relationship(
        "Slot",
        back_populates="temple",
        cascade="all, delete-orphan"
    )

    parking_zone = relationship(
        "ParkingZone",
        back_populates="temple",
        cascade="all, delete"
    )
    
