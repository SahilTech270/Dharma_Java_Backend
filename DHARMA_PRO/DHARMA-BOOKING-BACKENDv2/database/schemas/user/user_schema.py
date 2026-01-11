from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class UserBase(BaseModel):
    userName: str
    firstName: str
    lastName: str
    mobileNumber: str
    email: EmailStr
    gender: str
    state: str
    city: str
    profilePhoto: Optional[str] = None

class UserCreate(UserBase):
    password: constr(min_length=6, max_length=72)


# --------------------
# Login Schema
# --------------------
class UserLogin(BaseModel):
    identifier: str
    password: constr(min_length=6, max_length=72)


class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    mobileNumber: Optional[str] = None
    email: Optional[EmailStr] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    profilePhoto: Optional[str] = None
    password: Optional[constr(min_length=6, max_length=72)] = None

class UserResponse(UserBase):
    userId: int

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    userName: str
    email: EmailStr
    password: str
