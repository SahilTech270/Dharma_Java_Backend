from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.get_db import get_db
from database.models.admin.admin_model import Admin
from database.schemas.admin.admin_schema import AdminRegister, AdminLogin
from database.auth_utils import create_access_token
from pwdlib import PasswordHash

pwd_context = PasswordHash.recommended()
router = APIRouter(prefix="/admin/auth", tags=["Admin Authentication"])


@router.post("/register")
def register_admin(data: AdminRegister, db: Session = Depends(get_db)):

    exists = db.query(Admin).filter(Admin.email == data.email).first()
    if exists:
        raise HTTPException(400, "Admin already exists with this email")

    admin = Admin(
        adminName=data.adminName,
        email=data.email,
        password=pwd_context.hash(data.password)
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {"message": "Admin registered successfully", "adminId": admin.adminId}

