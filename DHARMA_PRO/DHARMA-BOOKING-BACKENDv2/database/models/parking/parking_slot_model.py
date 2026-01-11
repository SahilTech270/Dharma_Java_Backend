from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from database.database import Base
from sqlalchemy.orm import relationship

class ParkingSlots(Base):
    __tablename__ = "parking_slots"

    slotId = Column(Integer, primary_key=True, index=True)
    parkingId = Column(Integer, ForeignKey("parking_zone.parkingId"))
    slotAvailability = Column(Boolean, nullable=False)

    status = Column(Boolean, default=True)
    slotCapacity = Column(Integer, nullable=False)

    parking_zone = relationship("ParkingZone", back_populates="parking_slots")
