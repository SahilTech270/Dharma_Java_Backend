from sqlalchemy import Column, Integer, String
from database.database import Base

class Admin(Base):
    __tablename__ = "admins"

    adminId = Column(Integer, primary_key=True, index=True)
    adminName = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
