from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from ..dependencies import require_admin, get_current_user

router = APIRouter(prefix="/employees", tags=["Employees"])

def generate_employee_id(db: Session):
    count = db.query(models.Employee).count() + 1
    return f"DW{count:03d}"

@router.get("/", response_model=List[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Employee).all()

@router.post("/", response_model=schemas.EmployeeOut)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    existing = db.query(models.Employee).filter(models.Employee.email == employee.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.hash_password(employee.password)
    new_employee = models.Employee(
        employee_id=generate_employee_id(db),
        name=employee.name,
        email=employee.email,
        password=hashed_pw,
        department=employee.department,
        role=employee.role,
        shift=employee.shift,
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted"}

@router.put("/{employee_id}/reset-password")
def reset_password(employee_id: int, payload: schemas.PasswordReset, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee.password = auth.hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}