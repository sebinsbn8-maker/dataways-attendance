from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
from datetime import date as date_type, time

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
    date: date_type
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
    start_date: date_type
    end_date: date_type
    reason: Optional[str] = None

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    start_date: date_type
    end_date: date_type
    reason: Optional[str]
    status: str

    class Config:
        from_attributes = True

class LeaveStatusUpdate(BaseModel):
    status: str

class PasswordReset(BaseModel):
    new_password: str

class ShiftEntryCreate(BaseModel):
    employee_id: Optional[int] = None
    date: date_type
    shift_type: str
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    manual_hours: Optional[float] = None
    project_name: Optional[str] = None
    system_type: Optional[str] = None
    remarks: Optional[str] = None

class ShiftEntryOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    date: date_type
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
    totals_by_type: Dict[str, float]
    total_hours: float

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "Active"
    instructions: Optional[str] = None
    link: Optional[str] = None

class ProjectUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None
    instructions: Optional[str] = None
    link: Optional[str] = None

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str

    class Config:
        from_attributes = True

class ProjectEmployeeOut(BaseModel):
    id: int
    name: str
    employee_id: str

    class Config:
        from_attributes = True

class ProjectDetailOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    instructions: Optional[str]
    link: Optional[str]
    employees: List[ProjectEmployeeOut]

    class Config:
        from_attributes = True

class ProjectAssignRequest(BaseModel):
    employee_id: int

class ProjectOverviewEntry(BaseModel):
    employee_id: int
    employee_name: str
    hours: float

class ProjectOverview(BaseModel):
    project_id: int
    project_name: str
    total_hours: float
    by_employee: List[ProjectOverviewEntry]

class MyProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    instructions: Optional[str]
    link: Optional[str]
    hours_worked: float

class NotificationOut(BaseModel):
    id: int
    message: str
    is_read: str
    created_at: str

    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    employee_id: int
    message: str

class ContributorCreate(BaseModel):
    company_name: str
    process: Optional[str] = None
    industry_type: Optional[str] = None
    location: Optional[str] = None
    state: Optional[str] = None
    contact_number: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_designation: Optional[str] = None
    number_of_employees: Optional[str] = None
    participation_status: Optional[str] = "Interested"
    infolks_contact_person: Optional[str] = None
    referred_by: Optional[str] = None
    remarks: Optional[str] = None
    estimated_amount: Optional[str] = None
    field_visited_date: Optional[date_type] = None

class ContributorOut(BaseModel):
    id: int
    company_name: str
    process: Optional[str]
    industry_type: Optional[str]
    location: Optional[str]
    state: Optional[str]
    contact_number: Optional[str]
    contact_person_name: Optional[str]
    contact_person_designation: Optional[str]
    number_of_employees: Optional[str]
    participation_status: str
    infolks_contact_person: Optional[str]
    referred_by: Optional[str]
    remarks: Optional[str]
    estimated_amount: Optional[str]
    field_visited_date: Optional[date_type]

    class Config:
        from_attributes = True

class ClientCreate(BaseModel):
    sl_no: Optional[int] = None
    date: Optional[date_type] = None
    usecase: Optional[str] = None
    client_id: Optional[str] = None
    client_name: str
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    project_description: Optional[str] = None
    workflow_details: Optional[str] = None
    timeframe_shared: Optional[str] = None
    bd_executive: Optional[str] = None
    poc_coordinator: Optional[str] = None
    tool_type: Optional[str] = None
    tool_name: Optional[str] = None
    output_delivered: Optional[str] = None
    date_of_submission: Optional[date_type] = None
    phase: Optional[str] = None
    project_status: Optional[str] = None
    challenges: Optional[str] = None
    reason_for_dropping: Optional[str] = None
    remarks: Optional[str] = None

class ClientOut(BaseModel):
    id: int
    sl_no: Optional[int]
    date: Optional[date_type]
    usecase: Optional[str]
    client_id: Optional[str]
    client_name: str
    project_id: Optional[str]
    project_name: Optional[str]
    project_description: Optional[str]
    workflow_details: Optional[str]
    timeframe_shared: Optional[str]
    bd_executive: Optional[str]
    poc_coordinator: Optional[str]
    tool_type: Optional[str]
    tool_name: Optional[str]
    output_delivered: Optional[str]
    date_of_submission: Optional[date_type]
    phase: Optional[str]
    project_status: Optional[str]
    challenges: Optional[str]
    reason_for_dropping: Optional[str]
    remarks: Optional[str]

    class Config:
        from_attributes = True