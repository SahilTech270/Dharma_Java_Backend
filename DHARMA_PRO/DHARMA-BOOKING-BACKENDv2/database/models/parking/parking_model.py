from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from database.database import Base
from sqlalchemy.orm import relationship

class ParkingZone(Base):
    __tablename__ = "parking_zone"

    parkingId = Column(Integer, primary_key=True, index=True)
    templeId = Column(Integer, ForeignKey("temples.templeId"), index=True)
    totalSlots = Column(Integer, default=0)
    freeSlots = Column(Integer, default=0)
    filledSlots = Column(Integer, default=0)
    twoWheeler = Column(Integer, default=0)
    fourWheeler = Column(Integer, default=0)
    cctvCount = Column(Integer, default=0)
    status = Column(Boolean, default=True)
    
    # Relationship to Temple
    temple = relationship("Temple", back_populates="parking_zone")

    # Relationship to parking slots
    parking_slots = relationship(
        "ParkingSlots",
        back_populates="parking_zone",
        cascade="all, delete-orphan"
    )