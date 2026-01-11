from sqlalchemy import Column, Integer, Date, DateTime, Time, ForeignKey, func
from sqlalchemy.orm import relationship
from database.database import Base

class Slot(Base):
    __tablename__ = "slots"

    slotId = Column(Integer, primary_key=True, index=True, autoincrement=True)
    templeId = Column(Integer, ForeignKey("temples.templeId"), nullable=True)
    slotNumber = Column(Integer, nullable=True)

    startTime = Column(Time, nullable=True)
    endTime = Column(Time, nullable=True)

    date = Column(Date, nullable=True)

    capacity = Column(Integer, nullable=True)
    reservedOfflineTickets = Column(Integer, default=1000)
    onlineTickets = Column(Integer, nullable=True)

    remaining = Column(Integer, nullable=True)
    createdAt = Column(DateTime, server_default=func.now(), nullable=True)

    # Relationship
    temple = relationship("Temple", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot")
    
    def __repr__(self):
        return (
            f"<Slot slotId={self.slotId} templeId={self.templeId} "
            f"date={self.date} {self.startTime}-{self.endTime}>"
        )
