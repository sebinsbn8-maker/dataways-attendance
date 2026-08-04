from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..dependencies import require_admin

router = APIRouter(prefix="/clients", tags=["Client Database"])

@router.get("/", response_model=List[schemas.ClientOut])
def list_clients(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return db.query(models.ClientDatabase).order_by(models.ClientDatabase.id.desc()).all()

@router.post("/", response_model=schemas.ClientOut)
def create_client(payload: schemas.ClientCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    new_entry = models.ClientDatabase(**payload.dict())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.put("/{client_id}", response_model=schemas.ClientOut)
def update_client(client_id: int, payload: schemas.ClientCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    entry = db.query(models.ClientDatabase).filter(models.ClientDatabase.id == client_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Client entry not found")
    for key, value in payload.dict().items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    entry = db.query(models.ClientDatabase).filter(models.ClientDatabase.id == client_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Client entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Client entry deleted"}