# app/models.py

from sqlalchemy import Column, Integer, String, Boolean, Date, Float
from sqlalchemy.orm import declarative_base

from database.database import Base

class TrainingData(Base):
    __tablename__ = "footfall_training_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    date = Column(Date, unique=True, nullable=False)
    day = Column(String, nullable=False)
    isFestival = Column(Boolean, default=False)
    festivalIntensity = Column(Float, default=0.0)

    totalVisitors = Column(Integer, nullable=False)

