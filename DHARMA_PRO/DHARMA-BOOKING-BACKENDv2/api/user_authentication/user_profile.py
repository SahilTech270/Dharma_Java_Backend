from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.get_db import get_db
from database.dependencies import get_current_user
from database.models.user.user_model import User
from database.schemas.user.user_schema import UserResponse, UserUpdate
from api.user_authentication.user_registration import hash_password

router = APIRouter(prefix="/users", tags=["User Profile"])

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # user is the payload from token, usually has "id"
    db_user = db.query(User).filter(User.userId == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    payload: UserUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Not authorized")

    db_user = db.query(User).filter(User.userId == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields if provided
    if payload.firstName is not None:
        db_user.firstName = payload.firstName
    if payload.lastName is not None:
        db_user.lastName = payload.lastName
    if payload.mobileNumber is not None:
        db_user.mobileNumber = payload.mobileNumber
    if payload.email is not None:
        # Check if email is taken by another user
        existing_email = db.query(User).filter(User.email == payload.email, User.userId != user["id"]).first()
        if existing_email:
             raise HTTPException(status_code=400, detail="Email already registered")
        db_user.email = payload.email
    if payload.gender is not None:
        db_user.gender = payload.gender
    if payload.state is not None:
        db_user.state = payload.state
    if payload.city is not None:
        db_user.city = payload.city
    if payload.profilePhoto is not None:
        db_user.profilePhoto = payload.profilePhoto
    
    if payload.password is not None:
        db_user.password = hash_password(payload.password)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_profile(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Not authorized")

    db_user = db.query(User).filter(User.userId == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return
