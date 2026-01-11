# app/routers/router_training.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.get_db import get_db
from database.models.sarima.sarima_model import TrainingData
from database.schemas.sarima.sarima_schema import TrainingDataCreate, TrainingDataResponse

router = APIRouter(prefix="/training-data", tags=["Training Data"])

# ---------------------------------------------------------
# INSERT DAILY TRAINING ROW (step 1)
# ---------------------------------------------------------
@router.post("/", response_model=TrainingDataResponse)
def create_training_record(request: TrainingDataCreate, db: Session = Depends(get_db)):

    exist = db.query(TrainingData).filter(TrainingData.date == request.date).first()
    if exist:
        raise HTTPException(status_code=400, detail="Record for this date already exists.")

    record = TrainingData(
        date=request.date,
        day=request.day,
        isFestival=request.isFestival,
        festivalIntensity=request.festivalIntensity,
        totalVisitors=request.totalVisitors
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# ---------------------------------------------------------
# FETCH ALL DATA FOR SARIMA TRAINING (step 2)
# ---------------------------------------------------------
@router.get("/", response_model=list[TrainingDataResponse])
def get_all_training_data(db: Session = Depends(get_db)):
    data = db.query(TrainingData).order_by(TrainingData.date.asc()).all()
    return data
