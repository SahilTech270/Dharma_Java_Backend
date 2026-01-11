from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.orm import relationship
from database.database import Base


class User(Base):
    __tablename__ = "users"

    userId = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Required fields
    userName = Column(String(50), unique=True, nullable=False)
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    mobileNumber = Column(String(15), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    
    password = Column(String(200), nullable=False)

    gender = Column(String(20), nullable=False)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    profilePhoto = Column(Text, nullable=True)


    # Relationship to booking table (if exists)
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
