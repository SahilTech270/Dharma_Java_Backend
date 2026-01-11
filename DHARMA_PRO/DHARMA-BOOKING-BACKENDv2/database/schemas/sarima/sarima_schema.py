# app/schemas.py

from pydantic import BaseModel
from datetime import date

class TrainingDataCreate(BaseModel):
    date: date
    day: str
    isFestival: bool = False
    festivalIntensity: float = 0.0
    totalVisitors: int

class TrainingDataResponse(BaseModel):
    id: int
    date: date
    day: str
    isFestival: bool
    festivalIntensity: float
    totalVisitors: int

    class Config:
        orm_mode = True
