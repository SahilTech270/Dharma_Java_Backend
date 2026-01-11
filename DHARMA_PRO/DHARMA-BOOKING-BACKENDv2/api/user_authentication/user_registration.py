from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from pwdlib import PasswordHash

from database.get_db import get_db
from database.models.user.user_model import User
from database.schemas.user.user_schema import UserCreate

router = APIRouter(prefix="/users", tags=["User Registration"])

password_hash = PasswordHash.recommended()


def hash_password(password: str):
    return password_hash.hash(password)


@router.post("/register")
def register_user(payload: UserCreate, db: Session = Depends(get_db)):

    # check existing user
    user_exists = db.query(User).filter(
        (User.userName == payload.userName) |
        (User.email == payload.email)
    ).first()

    if user_exists:
        raise HTTPException(status_code=400, detail="Username or Email already exists")

    new_user = User(
        userName=payload.userName,
        firstName=payload.firstName,
        lastName=payload.lastName,
        mobileNumber=payload.mobileNumber,
        email=payload.email,
        gender=payload.gender,
        state=payload.state,
        city=payload.city,
        profilePhoto=payload.profilePhoto,
        password=hash_password(payload.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Registration Successful", "userId": new_user.userId}
