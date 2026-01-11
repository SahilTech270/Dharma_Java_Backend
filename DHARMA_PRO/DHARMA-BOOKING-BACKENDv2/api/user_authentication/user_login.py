# app/routers/user_login.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pwdlib import PasswordHash  # ✅ only this

from database.schemas.user.user_schema import UserLogin
from database.models.user.user_model import User
from database.get_db import get_db

router = APIRouter(
    prefix="/auth",
    tags=["User Login"]
)

password_hash = PasswordHash.recommended()


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


@router.post("/login")
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with identifier (userName or email) and password.
    """
    user = db.query(User).filter(
        (User.userName == credentials.identifier) | 
        (User.email == credentials.identifier)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Verify password
    if not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password"
        )

    from database.auth_utils import create_access_token
    
    access_token = create_access_token(
        data={"sub": user.email, "id": user.userId, "role": "user"}
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "userId": user.userId,
        "userName": user.userName,
        "email": user.email,
    }
