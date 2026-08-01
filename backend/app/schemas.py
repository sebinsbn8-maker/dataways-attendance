from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, time

class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: Optional[str] = None
    role: Optional[str] = "Employee"
    shift: Optional[str] = None

class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    name: str
    email: EmailStr
    department: Optional[str]
    role: str
    shift: Optional[str]
    status: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AttendanceOut(BaseModel):
    id: int
    date: date
    check_in: Optional[time]
    check_out: Optional[time]
    working_hours: Optional[float]

    class Config:
        from_attributes = True

class ShiftCreate(BaseModel):
    shift_name: str
    start_time: time
    end_time: time

class ShiftOut(BaseModel):
    id: int
    shift_name: str
    start_time: time
    end_time: time

    class Config:
        from_attributes = True

class LeaveCreate(BaseModel):
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    start_date: date
    end_date: date
    reason: Optional[str]
    status: str

    class Config:
        from_attributes = True

class LeaveStatusUpdate(BaseModel):
    status: str

class PasswordReset(BaseModel):
    new_password: str