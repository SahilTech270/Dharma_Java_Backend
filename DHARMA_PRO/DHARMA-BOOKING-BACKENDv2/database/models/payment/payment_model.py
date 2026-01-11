from sqlalchemy import Column, DateTime, Integer, String, Float, Date, ForeignKey ,func
from sqlalchemy.orm import relationship
from database.database import Base



class Payment(Base):
    __tablename__ = "payments"

    paymentId = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bookingId = Column(Integer, ForeignKey("bookings.bookingId"), nullable=False)

    amount = Column(Float, nullable=False)
    paymentMethod = Column(String(50), nullable=False)      # UPI / Card / NetBanking
    transactionId = Column(String(100), nullable=True)

    paymentDate = Column(DateTime, default =func.now())
    paymentStatus = Column(String(20), nullable=False, default="pending")

    booking = relationship("Booking", back_populates="payment")

    def __repr__(self):
        return f"<Payment(id={self.paymentId}, status={self.paymentStatus})>"
    
