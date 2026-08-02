from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..dependencies import require_admin

router = APIRouter(prefix="/contributors", tags=["Contributor Database"])

@router.get("/", response_model=List[schemas.ContributorOut])
def list_contributors(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return db.query(models.ContributorDatabase).order_by(models.ContributorDatabase.id.desc()).all()

@router.post("/", response_model=schemas.ContributorOut)
def create_contributor(payload: schemas.ContributorCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    new_entry = models.ContributorDatabase(**payload.dict())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.put("/{contributor_id}", response_model=schemas.ContributorOut)
def update_contributor(contributor_id: int, payload: schemas.ContributorCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    entry = db.query(models.ContributorDatabase).filter(models.ContributorDatabase.id == contributor_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Contributor entry not found")
    for key, value in payload.dict().items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{contributor_id}")
def delete_contributor(contributor_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    entry = db.query(models.ContributorDatabase).filter(models.ContributorDatabase.id == contributor_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Contributor entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Contributor entry deleted"}