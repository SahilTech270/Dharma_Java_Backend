from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.get_db import get_db
from database.models.admin.admin_model import Admin
from database.schemas.admin.admin_schema import AdminLogin, AdminUpdate, AdminResponse
from database.auth_utils import create_access_token
from pwdlib import PasswordHash
from database.dependencies import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

# pwd_context = PasswordHash.recommended()
router = APIRouter(prefix="/admin/auth", tags=["Admin Authentication"])

@router.post("/login")
def admin_login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):

    admin = db.query(Admin).filter(Admin.email == form_data.username).first()
    if not admin:
        raise HTTPException(404, "Admin not found")

    # if not pwd_context.verify(form_data.password, admin.password):
    #     raise HTTPException(400, "Incorrect password")

    token = create_access_token({
        "id": admin.adminId,
        "role": "admin"     # MUST HAVE
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_admin_profile(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")

    admin = db.query(Admin).filter(Admin.adminId == user["id"]).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    return {"name":admin.adminName}

@router.put("/update", response_model=AdminResponse)
def update_admin(
    updates: AdminUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")

    admin = db.query(Admin).filter(Admin.adminId == user["id"]).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    # Update name
    if updates.adminName:
        admin.adminName = updates.adminName

    # Update email & check duplicate
    if updates.email:
        exists = db.query(Admin).filter(Admin.email == updates.email).first()
        if exists and exists.adminId != admin.adminId:
            raise HTTPException(400, "Email already used by another admin")
        admin.email = updates.email

    # Update password
    if updates.password:
        admin.password = pwd_context.hash(updates.password)

    db.commit()
    db.refresh(admin)

    return admin

@router.delete("/delete", status_code=200)
def delete_admin(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    if user["role"] != "admin":
        raise HTTPException(403, "Not authorized")

    admin = db.query(Admin).filter(Admin.adminId == user["id"]).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    db.delete(admin)
    db.commit()

    return {"message": "Admin account deleted successfully"}
