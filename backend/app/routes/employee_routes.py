from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as date_type
from calendar import monthrange
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

@router.get("/{employee_id}/stats")
def employee_stats(
    employee_id: int,
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    today = date_type.today()
    target_year = year or today.year
    target_month = month or today.month

    # Today's entry
    today_entry = db.query(models.ShiftEntry).filter(
        models.ShiftEntry.employee_id == employee_id,
        models.ShiftEntry.date == today,
    ).first()

    # Monthly totals
    month_start = date_type(target_year, target_month, 1)
    month_end = date_type(target_year, target_month, monthrange(target_year, target_month)[1])
    month_entries = db.query(models.ShiftEntry).filter(
        models.ShiftEntry.employee_id == employee_id,
        models.ShiftEntry.date >= month_start,
        models.ShiftEntry.date <= month_end,
    ).all()

    month_totals_by_type = {}
    month_total_hours = 0
    for e in month_entries:
        month_totals_by_type[e.shift_type] = month_totals_by_type.get(e.shift_type, 0) + e.hours
        month_total_hours += e.hours

    # Yearly totals (by month)
    year_start = date_type(target_year, 1, 1)
    year_end = date_type(target_year, 12, 31)
    year_entries = db.query(models.ShiftEntry).filter(
        models.ShiftEntry.employee_id == employee_id,
        models.ShiftEntry.date >= year_start,
        models.ShiftEntry.date <= year_end,
    ).all()

    hours_by_month = {m: 0 for m in range(1, 13)}
    year_total_hours = 0
    for e in year_entries:
        hours_by_month[e.date.month] += e.hours
        year_total_hours += e.hours

    # Leaves taken (approved, within the year)
    leaves = db.query(models.Leave).filter(
        models.Leave.employee_id == employee_id,
        models.Leave.status == "Approved",
    ).all()

    leave_days_this_year = 0
    for lv in leaves:
        if lv.start_date.year == target_year or lv.end_date.year == target_year:
            leave_days_this_year += (lv.end_date - lv.start_date).days + 1

    leave_counts = {"Pending": 0, "Approved": 0, "Rejected": 0}
    all_leaves = db.query(models.Leave).filter(models.Leave.employee_id == employee_id).all()
    for lv in all_leaves:
        leave_counts[lv.status] = leave_counts.get(lv.status, 0) + 1

    return {
        "employee": {
            "id": employee.id,
            "employee_id": employee.employee_id,
            "name": employee.name,
            "email": employee.email,
            "department": employee.department,
            "role": employee.role,
        },
        "today": {
            "date": str(today),
            "shift_type": today_entry.shift_type if today_entry else None,
            "check_in": str(today_entry.check_in) if today_entry and today_entry.check_in else None,
            "check_out": str(today_entry.check_out) if today_entry and today_entry.check_out else None,
            "hours": today_entry.hours if today_entry else None,
        },
        "month": {
            "year": target_year,
            "month": target_month,
            "totals_by_type": month_totals_by_type,
            "total_hours": month_total_hours,
        },
        "year": {
            "year": target_year,
            "hours_by_month": hours_by_month,
            "total_hours": year_total_hours,
        },
        "leaves": {
            "days_taken_this_year": leave_days_this_year,
            "counts_by_status": leave_counts,
        },
    }