# routers/parking_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.get_db import get_db
from database.dependencies import get_current_user
from database.models.parking.parking_model import ParkingZone
from database.schemas.parking.parking_schema import ParkingCreate, ParkingUpdate, ParkingOut

router = APIRouter(
    prefix="/parking",
    tags=["Parking"]
)


# 🔹 Create parking zone
@router.post("/", response_model=ParkingOut, status_code=status.HTTP_201_CREATED)
def create_parking_zone(
    data: ParkingCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    parking = ParkingZone(
        templeId=data.templeId,
        totalSlots=data.totalSlots,
        freeSlots=data.freeSlots,
        filledSlots=data.filledSlots,
        twoWheeler=data.twoWheeler,
        fourWheeler=data.fourWheeler,
        cctvCount=data.cctvCount,
        status=data.status,
    )

    db.add(parking)
    db.commit()
    db.refresh(parking)
    return parking


# 🔹 Get all parking zones
@router.get("/", response_model=list[ParkingOut])
def get_all_parking_zones(
    db: Session = Depends(get_db),
):
    parking_zones = db.query(ParkingZone).all()
    return parking_zones


# 🔹 Get parking zone by ID
@router.get("/{parking_id}", response_model=ParkingOut)
def get_parking_zone_by_id(
    parking_id: int,
    db: Session = Depends(get_db),
):
    parking = db.query(ParkingZone).filter(ParkingZone.parkingId == parking_id).first()
    if not parking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking zone not found",
        )
    return parking


# 🔹 Get parking zones by temple
@router.get("/temple/{temple_id}", response_model=list[ParkingOut])
def get_parking_zones_by_temple(
    temple_id: int,
    db: Session = Depends(get_db),
):
    parking_zones = (
        db.query(ParkingZone)
        .filter(ParkingZone.templeId == temple_id)
        .all()
    )
    return parking_zones


# 🔹 Update parking zone
@router.put("/{parking_id}", response_model=ParkingOut)
def update_parking_zone(
    parking_id: int,
    data: ParkingUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    parking = db.query(ParkingZone).filter(ParkingZone.parkingId == parking_id).first()
    if not parking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking zone not found",
        )

    # apply only provided fields
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(parking, field, value)

    db.commit()
    db.refresh(parking)
    return parking


# 🔹 Delete parking zone
@router.delete("/{parking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_parking_zone(
    parking_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    parking = db.query(ParkingZone).filter(ParkingZone.parkingId == parking_id).first()
    if not parking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking zone not found",
        )

    db.delete(parking)
    db.commit()
    return
