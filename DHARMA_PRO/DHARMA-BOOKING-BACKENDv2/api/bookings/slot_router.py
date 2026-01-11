# api/slot_router.py
from datetime import date as date_type
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.dependencies import get_current_user
from database.get_db import get_db
from database.models.booking.slot_model import Slot
from database.models.temple.temple_model import Temple
from database.schemas.booking.slot_schema import SlotCreate, SlotUpdate, SlotResponse
from database.models.admin.admin_model import Admin

router = APIRouter(prefix="/slots", tags=["Slots"])

@router.post("/", response_model=SlotResponse, status_code=status.HTTP_201_CREATED)
def create_slot(
    payload: SlotCreate, 
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")

    admin = db.query(Admin).filter(Admin.adminId == user["id"]).first()

    if not admin:
        raise HTTPException(404, "Admin not found")


    # Ensure temple exists
    temple = db.query(Temple).filter(Temple.templeId == payload.templeId).first()
    if not temple:
        raise HTTPException(status_code=404, detail="Temple not found")

    # Validate time
    if payload.endTime <= payload.startTime:
        raise HTTPException(status_code=400, detail="endTime must be after startTime")

    # CHECK FOR OVERLAPPING SLOTS (same temple + same date)
    overlap = (
        db.query(Slot)
        .filter(
            Slot.templeId == payload.templeId,
            Slot.date == payload.date,
            Slot.startTime < payload.endTime,
            Slot.endTime > payload.startTime,
        )
        .first()
    )

    if overlap:
        raise HTTPException(status_code=400, detail="Another slot overlaps with this time range")

    # Map schema -> model field names (model uses totalTickets/reservedOfflineTickets/onlineTickets/remainingTickets)
    capacity = payload.capacity
    reserved_offline = payload.reservedOfflineTickets
    
    if reserved_offline > capacity:
        raise HTTPException(status_code=400, detail="reservedOfflineTickets cannot be greater than capacity")

    onlineTickets = capacity - reserved_offline

    remaining = payload.remaining if payload.remaining is not None else onlineTickets

    if remaining > capacity:
        raise HTTPException(status_code=400, detail="remaining cannot be greater than total capacity")

    if capacity <= 0 or remaining < 0:
        raise HTTPException(status_code=400, detail="capacity and remaining must be positive")

    # Auto slotNumber (increment based on existing slots for temple)
    last_slot = (
        db.query(Slot).filter(Slot.templeId == payload.templeId).order_by(Slot.slotNumber.desc()).first()
    )
    slotNumber = (last_slot.slotNumber + 1) if last_slot else 1

    new_slot = Slot(
        templeId=payload.templeId,
        date=payload.date,
        startTime=payload.startTime,
        endTime=payload.endTime,
        slotNumber=slotNumber,
        capacity=capacity,
        reservedOfflineTickets=reserved_offline,
        onlineTickets=onlineTickets,
        remaining=remaining,
    )

    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)

    return new_slot

@router.get("/", response_model=List[SlotResponse])
def get_all_slots(templeId: Optional[int] = None, date: Optional[date_type] = None, db: Session = Depends(get_db)):
    query = db.query(Slot)

    if templeId is not None:
        query = query.filter(Slot.templeId == templeId)

    if date is not None:
        query = query.filter(Slot.date == date)

    query = query.order_by(Slot.date, Slot.startTime)

    return query.all()


@router.get("/{slot_id}", response_model=SlotResponse)
def get_slot_by_id(slot_id: int, db: Session = Depends(get_db)):
    slot = db.query(Slot).filter(Slot.slotId == slot_id).first()  # CHANGED
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return slot


@router.put("/{slot_id}", response_model=SlotResponse)
def update_slot(
    slot_id: int, payload: SlotUpdate, 
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")

    admin = db.query(Admin).filter(Admin.adminId == user["id"]).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    
    slot = db.query(Slot).filter(Slot.slotId == slot_id).first()  # CHANGED
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    # Apply changes BEFORE validating (but validate inputs as they come)
    if payload.date is not None:
        slot.date = payload.date
    if payload.startTime is not None:
        slot.startTime = payload.startTime
    if payload.endTime is not None:
        slot.endTime = payload.endTime

    if payload.capacity is not None:
        if payload.capacity <= 0:
            raise HTTPException(status_code=400, detail="capacity must be positive")

        diff = payload.capacity - slot.capacity
        slot.capacity = payload.capacity
        # Recalculate online tickets based on new capacity and existing (or new) reserved offline
        current_reserved_offline = payload.reservedOfflineTickets if payload.reservedOfflineTickets is not None else slot.reservedOfflineTickets
        if current_reserved_offline > slot.capacity:
             raise HTTPException(status_code=400, detail="reservedOfflineTickets cannot be greater than capacity")
        
        slot.reservedOfflineTickets = current_reserved_offline
        slot.onlineTickets = slot.capacity - slot.reservedOfflineTickets
        slot.remaining = max(0, slot.remaining + diff)  # Adjust remaining by capacity change

    if payload.reservedOfflineTickets is not None and payload.capacity is None:
         if payload.reservedOfflineTickets > slot.capacity:
             raise HTTPException(status_code=400, detail="reservedOfflineTickets cannot be greater than capacity")
         
         # If only reservedOfflineTickets changes, we need to adjust onlineTickets and remaining
         old_reserved = slot.reservedOfflineTickets
         slot.reservedOfflineTickets = payload.reservedOfflineTickets
         slot.onlineTickets = slot.capacity - slot.reservedOfflineTickets
         
         # Adjust remaining: if we increased reserved offline, we decrease remaining (and vice versa)
         # But remaining tracks *available online tickets*. 
         # So if we reserve MORE for offline, available online decreases.
         reserved_diff = payload.reservedOfflineTickets - old_reserved
         slot.remaining = max(0, slot.remaining - reserved_diff)

    if payload.remaining is not None:
        if payload.remaining < 0:
            raise HTTPException(status_code=400, detail="remaining must be non-negative")
        slot.remaining = payload.remaining  # CHANGED

    # Validate timings
    if slot.endTime <= slot.startTime:
        raise HTTPException(status_code=400, detail="endTime must be after startTime")

    if slot.remaining > slot.capacity:
        raise HTTPException(status_code=400, detail="remaining cannot be greater than capacity")

    db.commit()
    db.refresh(slot)
    return slot


@router.delete("/{slot_id}", status_code=status.HTTP_200_OK)
def delete_slot(slot_id: int, db: Session = Depends(get_db), 
    user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")

    admin = db.query(Admin).filter(Admin.adminId == user["id"]).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    slot = db.query(Slot).filter(Slot.slotId == slot_id).first()  # CHANGED
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    db.delete(slot)
    db.commit()
    return {"message": "Slot deleted successfully"}
