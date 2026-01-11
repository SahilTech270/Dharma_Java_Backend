from sqlalchemy import Column, Integer, String, Text, DateTime, func
from database.database import Base

class SMSLog(Base):
    __tablename__ = "sms_logs"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, nullable=False)
    mobileNumber = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Text, default="PENDING")
    created_at = Column(DateTime, server_default=func.now())
