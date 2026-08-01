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
    employee_name: Optional[str] = None
    start_date: date
    end_date: date
    reason: Optional[str]
    status: str

    class Config:
        from_attributes = True

class LeaveStatusUpdate(BaseModel):
    status: str  # "Approved" or "Rejected"

class ShiftEntryCreate(BaseModel):
    employee_id: Optional[int] = None  # Admin only: which employee this entry is for. Employees leave this blank.
    date: date
    shift_type: str  # General, Morning, Evening, Night, OT, Work From Home, Half Day, Leave
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    manual_hours: Optional[float] = None  # required only when shift_type is OT or Work From Home
    project_name: Optional[str] = None
    system_type: Optional[str] = None  # "Personal" or "Office"
    remarks: Optional[str] = None

class ShiftEntryOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    date: date
    shift_type: str
    check_in: Optional[time]
    check_out: Optional[time]
    hours: float
    project_name: Optional[str]
    system_type: Optional[str]
    remarks: Optional[str]

    class Config:
        from_attributes = True

class ShiftEntryMonthlySummary(BaseModel):
    employee_id: int
    employee_name: str
    month: int
    year: int
    totals_by_type: dict
    total_hours: float