from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/check-in", response_model=schemas.AttendanceOut)
def check_in(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        models.Attendance.date == today
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")

    record = models.Attendance(
        employee_id=current_user.id,
        date=today,
        check_in=datetime.now().time()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.post("/check-out", response_model=schemas.AttendanceOut)
def check_out(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    record = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        models.Attendance.date == today
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="You haven't checked in today")
    if record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out today")

    now = datetime.now()
    check_in_dt = datetime.combine(today, record.check_in)
    record.check_out = now.time()
    record.working_hours = round((now - check_in_dt).total_seconds() / 3600, 2)

    db.commit()
    db.refresh(record)
    return record

@router.get("/today", response_model=schemas.AttendanceOut | None)
def get_today(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    record = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        models.Attendance.date == today
    ).first()
    return record

@router.get("/history", response_model=List[schemas.AttendanceOut])
def get_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id
    ).order_by(models.Attendance.date.desc()).all()