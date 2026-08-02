from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_admin

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def create_notification(db: Session, employee_id: int, message: str):
    notif = models.Notification(
        employee_id=employee_id,
        message=message,
        is_read="No",
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(notif)
    db.commit()

@router.get("/my", response_model=List[schemas.NotificationOut])
def my_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Notification).filter(
        models.Notification.employee_id == current_user.id
    ).order_by(models.Notification.id.desc()).all()

@router.put("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.employee_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = "Yes"
    db.commit()
    return {"message": "Marked as read"}

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db.query(models.Notification).filter(
        models.Notification.employee_id == current_user.id,
        models.Notification.is_read == "No",
    ).update({"is_read": "Yes"})
    db.commit()
    return {"message": "All marked as read"}

@router.post("/", response_model=schemas.NotificationOut)
def send_notification(payload: schemas.NotificationCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    employee = db.query(models.Employee).filter(models.Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    notif = models.Notification(
        employee_id=payload.employee_id,
        message=payload.message,
        is_read="No",
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif