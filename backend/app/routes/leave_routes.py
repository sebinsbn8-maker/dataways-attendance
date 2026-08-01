from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_admin

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post("/", response_model=schemas.LeaveOut)
def apply_leave(leave: schemas.LeaveCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    new_leave = models.Leave(
        employee_id=current_user.id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
    )
    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    out = schemas.LeaveOut.model_validate(new_leave)
    out.employee_name = new_leave.employee.name if new_leave.employee else None
    return out

@router.get("/my", response_model=List[schemas.LeaveOut])
def my_leaves(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    leaves = db.query(models.Leave).filter(models.Leave.employee_id == current_user.id).order_by(models.Leave.id.desc()).all()
    result = []
    for leave in leaves:
        out = schemas.LeaveOut.model_validate(leave)
        out.employee_name = leave.employee.name if leave.employee else None
        result.append(out)
    return result

@router.get("/", response_model=List[schemas.LeaveOut])
def all_leaves(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    leaves = db.query(models.Leave).order_by(models.Leave.id.desc()).all()
    result = []
    for leave in leaves:
        out = schemas.LeaveOut.model_validate(leave)
        out.employee_name = leave.employee.name if leave.employee else None
        result.append(out)
    return result

@router.put("/{leave_id}/status", response_model=schemas.LeaveOut)
def update_leave_status(leave_id: int, update: schemas.LeaveStatusUpdate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if update.status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'Approved' or 'Rejected'")
    leave.status = update.status
    db.commit()
    db.refresh(leave)
    out = schemas.LeaveOut.model_validate(leave)
    out.employee_name = leave.employee.name if leave.employee else None
    return out

@router.delete("/{leave_id}")
def cancel_leave(leave_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if current_user.role != "Admin" and leave.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own leave requests")
    db.delete(leave)
    db.commit()
    return {"message": "Leave request cancelled"}