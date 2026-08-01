from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as date_type
from calendar import monthrange
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_admin

router = APIRouter(prefix="/shift-entries", tags=["Shift Entries"])

FIXED_HOURS = {
    "General": 7,
    "Morning": 7,
    "Evening": 7,
    "Night": 7,
    "Half Day": 3.5,
    "Leave": 0,
}
MANUAL_HOUR_TYPES = ["OT", "Work From Home"]
VALID_SHIFT_TYPES = list(FIXED_HOURS.keys()) + MANUAL_HOUR_TYPES


def calculate_hours(shift_type: str, manual_hours: Optional[float]):
    if shift_type in FIXED_HOURS:
        return FIXED_HOURS[shift_type]
    if shift_type in MANUAL_HOUR_TYPES:
        if manual_hours is None:
            raise HTTPException(status_code=400, detail=f"manual_hours is required for shift_type '{shift_type}'")
        return manual_hours
    raise HTTPException(status_code=400, detail=f"Invalid shift_type. Must be one of {VALID_SHIFT_TYPES}")


def to_out(entry: models.ShiftEntry) -> schemas.ShiftEntryOut:
    out = schemas.ShiftEntryOut.model_validate(entry)
    out.employee_name = entry.employee.name if entry.employee else None
    return out


@router.post("/", response_model=schemas.ShiftEntryOut)
def create_entry(
    entry: schemas.ShiftEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    target_employee_id = current_user.id
    if entry.employee_id is not None:
        if current_user.role != "Admin":
            raise HTTPException(status_code=403, detail="Only Admin can log entries for other employees")
        target_employee_id = entry.employee_id

    hours = calculate_hours(entry.shift_type, entry.manual_hours)

    new_entry = models.ShiftEntry(
        employee_id=target_employee_id,
        date=entry.date,
        shift_type=entry.shift_type,
        check_in=entry.check_in,
        check_out=entry.check_out,
        hours=hours,
        project_name=entry.project_name,
        system_type=entry.system_type,
        remarks=entry.remarks,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return to_out(new_entry)


@router.get("/my", response_model=List[schemas.ShiftEntryOut])
def my_entries(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    query = db.query(models.ShiftEntry).filter(models.ShiftEntry.employee_id == current_user.id)
    if month and year:
        start = date_type(year, month, 1)
        end = date_type(year, month, monthrange(year, month)[1])
        query = query.filter(models.ShiftEntry.date >= start, models.ShiftEntry.date <= end)
    entries = query.order_by(models.ShiftEntry.date.desc()).all()
    return [to_out(e) for e in entries]


@router.get("/", response_model=List[schemas.ShiftEntryOut])
def all_entries(
    employee_id: Optional[int] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(require_admin),
):
    query = db.query(models.ShiftEntry)
    if employee_id:
        query = query.filter(models.ShiftEntry.employee_id == employee_id)
    if month and year:
        start = date_type(year, month, 1)
        end = date_type(year, month, monthrange(year, month)[1])
        query = query.filter(models.ShiftEntry.date >= start, models.ShiftEntry.date <= end)
    entries = query.order_by(models.ShiftEntry.date.desc()).all()
    return [to_out(e) for e in entries]


@router.put("/{entry_id}", response_model=schemas.ShiftEntryOut)
def update_entry(
    entry_id: int,
    entry: schemas.ShiftEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    existing = db.query(models.ShiftEntry).filter(models.ShiftEntry.id == entry_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Shift entry not found")
    if current_user.role != "Admin" and existing.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own entries")

    hours = calculate_hours(entry.shift_type, entry.manual_hours)

    existing.date = entry.date
    existing.shift_type = entry.shift_type
    existing.check_in = entry.check_in
    existing.check_out = entry.check_out
    existing.hours = hours
    existing.project_name = entry.project_name
    existing.system_type = entry.system_type
    existing.remarks = entry.remarks
    if current_user.role == "Admin" and entry.employee_id is not None:
        existing.employee_id = entry.employee_id

    db.commit()
    db.refresh(existing)
    return to_out(existing)


@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    existing = db.query(models.ShiftEntry).filter(models.ShiftEntry.id == entry_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Shift entry not found")
    if current_user.role != "Admin" and existing.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own entries")

    db.delete(existing)
    db.commit()
    return {"message": "Shift entry deleted"}


@router.get("/summary", response_model=List[schemas.ShiftEntryMonthlySummary])
def monthly_summary(
    month: int,
    year: int,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    start = date_type(year, month, 1)
    end = date_type(year, month, monthrange(year, month)[1])

    if current_user.role == "Admin":
        query = db.query(models.ShiftEntry).filter(models.ShiftEntry.date >= start, models.ShiftEntry.date <= end)
        if employee_id:
            query = query.filter(models.ShiftEntry.employee_id == employee_id)
    else:
        query = db.query(models.ShiftEntry).filter(
            models.ShiftEntry.employee_id == current_user.id,
            models.ShiftEntry.date >= start,
            models.ShiftEntry.date <= end,
        )

    entries = query.all()

    summary_by_employee = {}
    for e in entries:
        if e.employee_id not in summary_by_employee:
            summary_by_employee[e.employee_id] = {
                "employee_id": e.employee_id,
                "employee_name": e.employee.name if e.employee else "",
                "month": month,
                "year": year,
                "totals_by_type": {},
                "total_hours": 0,
            }
        bucket = summary_by_employee[e.employee_id]
        bucket["totals_by_type"][e.shift_type] = bucket["totals_by_type"].get(e.shift_type, 0) + e.hours
        bucket["total_hours"] += e.hours

    return list(summary_by_employee.values())