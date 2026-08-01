from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_admin

router = APIRouter(prefix="/shifts", tags=["Shifts"])

@router.get("/", response_model=List[schemas.ShiftOut])
def list_shifts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Shift).all()

@router.post("/", response_model=schemas.ShiftOut)
def create_shift(shift: schemas.ShiftCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    new_shift = models.Shift(
        shift_name=shift.shift_name,
        start_time=shift.start_time,
        end_time=shift.end_time,
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift

@router.delete("/{shift_id}")
def delete_shift(shift_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    db.delete(shift)
    db.commit()
    return {"message": "Shift deleted"}