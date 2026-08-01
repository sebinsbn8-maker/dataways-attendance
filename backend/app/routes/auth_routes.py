from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from pydantic import BaseModel
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = "458788756700-1764elbgct5hajvap0qvl0dhq96qsph1.apps.googleusercontent.com"

def generate_employee_id(db: Session):
    count = db.query(models.Employee).count() + 1
    return f"DW{count:03d}"

@router.post("/register", response_model=schemas.EmployeeOut)
def register(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
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
        role="Employee",
        shift=employee.shift,
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Employee).filter(models.Employee.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth.create_access_token(data={"sub": user.email, "role": user.role, "name": user.name})
    return {"access_token": token, "token_type": "bearer"}


class GoogleLoginRequest(BaseModel):
    credential: str

@router.post("/google", response_model=schemas.Token)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(payload.credential, google_requests.Request(), GOOGLE_CLIENT_ID)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    name = idinfo.get("name", email)

    user = db.query(models.Employee).filter(models.Employee.email == email).first()
    if not user:
        import secrets
        user = models.Employee(
            employee_id=generate_employee_id(db),
            name=name,
            email=email,
            password=auth.hash_password(secrets.token_urlsafe(32)),
            role="Employee",
            status="Active",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = auth.create_access_token(data={"sub": user.email, "role": user.role, "name": user.name})
    return {"access_token": token, "token_type": "bearer"}