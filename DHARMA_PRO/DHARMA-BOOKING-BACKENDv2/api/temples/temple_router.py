from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.dependencies import get_current_user

from database.get_db import get_db
from database.models.temple.temple_model import Temple
from database.schemas.temple.temple_schema import TempleCreate, TempleUpdate, TempleResponse

router = APIRouter(prefix="/temples", tags=["Temples"])

@router.post("/", response_model=TempleResponse, status_code=status.HTTP_201_CREATED)
def create_temple(
    temple: TempleCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):

    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")
    
    exists = db.query(Temple).filter(Temple.templeName == temple.templeName).first()
    if exists:
        raise HTTPException(
            status_code=400,
            detail=f"Temple '{temple.templeName}' already exists",
        )

    new_temple = Temple(
        templeName=temple.templeName,
        location=temple.location,
    )

    db.add(new_temple)
    db.commit()
    db.refresh(new_temple)

    return new_temple


@router.get("/", response_model=list[TempleResponse])
def get_all_temples(db: Session = Depends(get_db)):
    return db.query(Temple).order_by(Temple.templeName).all()


@router.get("/{temple_id}", response_model=TempleResponse)
def get_temple(temple_id: int, db: Session = Depends(get_db)):
    temple = db.query(Temple).filter(Temple.templeId == temple_id).first()
    if not temple:
        raise HTTPException(
            status_code=404,
            detail="Temple not found",
        )
    return temple


@router.put("/{temple_id}", response_model=TempleResponse)
def update_temple(
    temple_id: int,
    updates: TempleUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):

    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")
    
    temple = db.query(Temple).filter(Temple.templeId == temple_id).first()

    if not temple:
        raise HTTPException(
            status_code=404,
            detail="Temple not found",
        )

    # Check duplicate temple name if updated
    if updates.templeName is not None:
        exists = (
            db.query(Temple)
            .filter(Temple.templeName == updates.templeName)
            .filter(Temple.templeId != temple_id)
            .first()
        )
        if exists:
            raise HTTPException(
                status_code=400,
                detail=f"Temple '{updates.templeName}' already exists",
            )
        temple.templeName = updates.templeName

    # Update location
    if updates.location is not None:
        temple.location = updates.location

    db.commit()
    db.refresh(temple)

    return temple


@router.delete("/{temple_id}", status_code=status.HTTP_200_OK)
def delete_temple(
    temple_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):

    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")
    
    temple = db.query(Temple).filter(Temple.templeId == temple_id).first()

    if not temple:
        raise HTTPException(
            status_code=404,
            detail="Temple not found",
        )

    db.delete(temple)
    db.commit()

    return {"message": "Temple deleted successfully"}
