from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Float, Text, Table
from sqlalchemy.orm import relationship
from .database import Base

project_assignments = Table(
    "project_assignments",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("employee_id", Integer, ForeignKey("employees.id"), primary_key=True),
)

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    department = Column(String)
    role = Column(String, default="Employee")  # Admin, Employee, HR
    shift = Column(String)
    status = Column(String, default="Active")
    attendance_records = relationship("Attendance", back_populates="employee")
    projects = relationship("Project", secondary=project_assignments, back_populates="employees")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    check_in = Column(Time)
    check_out = Column(Time)
    working_hours = Column(Float)
    employee = relationship("Employee", back_populates="attendance_records")

class Shift(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True, index=True)
    shift_name = Column(String, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String)
    status = Column(String, default="Pending")  # Pending, Approved, Rejected
    employee = relationship("Employee")

class ShiftEntry(Base):
    __tablename__ = "shift_entries"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    shift_type = Column(String, nullable=False)  # General, Morning, Evening, Night, OT, Work From Home, Half Day, Leave
    check_in = Column(Time)
    check_out = Column(Time)
    hours = Column(Float, default=0)
    project_name = Column(String)
    system_type = Column(String)  # Personal or Office
    remarks = Column(String)
    employee = relationship("Employee")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    status = Column(String, default="Active")  # Active, Completed, On Hold
    instructions = Column(Text)
    link = Column(String)
    employees = relationship("Employee", secondary=project_assignments, back_populates="projects")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    message = Column(String, nullable=False)
    is_read = Column(String, default="No")  # "Yes" or "No"
    created_at = Column(String)  # stored as ISO string
    employee = relationship("Employee")

class ContributorDatabase(Base):
    __tablename__ = "contributor_database"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    process = Column(String)
    industry_type = Column(String)
    location = Column(String)
    state = Column(String)
    contact_number = Column(String)
    contact_person_name = Column(String)
    contact_person_designation = Column(String)
    number_of_employees = Column(String)
    participation_status = Column(String, default="Interested")  # Interested, Not Interested
    infolks_contact_person = Column(String)
    referred_by = Column(String)
    remarks = Column(Text)
    estimated_amount = Column(String)
    field_visited_date = Column(Date)

class ClientDatabase(Base):
    __tablename__ = "client_database"
    id = Column(Integer, primary_key=True, index=True)
    sl_no = Column(Integer)
    date = Column(Date)
    usecase = Column(String)
    client_id = Column(String)
    client_name = Column(String, nullable=False)
    project_id = Column(String)
    project_name = Column(String)
    project_description = Column(Text)
    workflow_details = Column(Text)
    timeframe_shared = Column(String)
    bd_executive = Column(String)
    poc_coordinator = Column(String)
    tool_type = Column(String)  # Client Tool / Internal Tool
    tool_name = Column(String)
    output_delivered = Column(String)  # Yes / No
    date_of_submission = Column(Date)
    phase = Column(String)  # Sample Phase / Enquiry Phase
    project_status = Column(String)  # Real Phase, Pending, Ongoing, Dropped, Postponed, Paid sample, Waiting for feedback
    challenges = Column(Text)
    reason_for_dropping = Column(Text)
    remarks = Column(Text)