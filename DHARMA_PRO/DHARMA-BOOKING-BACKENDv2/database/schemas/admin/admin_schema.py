from pydantic import BaseModel, EmailStr

class AdminRegister(BaseModel):
    adminName: str
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminUpdate(BaseModel):
    adminName: str | None = None
    email: EmailStr | None = None
    password: str | None = None

class AdminResponse(BaseModel):
    adminId: int
    adminName: str
    email: EmailStr

    class Config:
        from_attributes = True
