# routers/slot_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.get_db import get_db
from database.dependencies import get_current_user
from database.models.parking.parking_slot_model import ParkingSlots
from database.schemas.parking.parking_slot_schema import SlotCreate, SlotUpdate, SlotOut


router = APIRouter(
    prefix="/parking-slots",
    tags=["Parking Slots"]
)


@router.post("/", response_model=SlotOut, status_code=status.HTTP_201_CREATED)
def create_slot(
    data: SlotCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    slot = ParkingSlots(
        parkingId=data.parkingId,
        slotAvailability=data.slotAvailability,
        status=data.status,
        slotCapacity=data.slotCapacity,
    )

    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.get("/", response_model=list[SlotOut])
def get_all_slots(
    db: Session = Depends(get_db),
):
    slots = db.query(ParkingSlots).all()
    return slots


@router.get("/{slot_id}", response_model=SlotOut)
def get_slot_by_id(
    slot_id: int,
    db: Session = Depends(get_db),
):
    slot = db.query(ParkingSlots).filter(ParkingSlots.slotId == slot_id).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found"
        )
    return slot


@router.get("/parking/{parking_id}", response_model=list[SlotOut])
def get_slots_by_parking_id(
    parking_id: int,
    db: Session = Depends(get_db),
):
    slots = db.query(ParkingSlots).filter(ParkingSlots.parkingId == parking_id).all()
    return slots


@router.put("/{slot_id}", response_model=SlotOut)
def update_slot(
    slot_id: int,
    data: SlotUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    slot = db.query(ParkingSlots).filter(ParkingSlots.slotId == slot_id).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found"
        )

    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(slot, field, value)

    db.commit()
    db.refresh(slot)
    return slot


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    slot = db.query(ParkingSlots).filter(ParkingSlots.slotId == slot_id).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found"
        )

    db.delete(slot)
    db.commit()
    return
