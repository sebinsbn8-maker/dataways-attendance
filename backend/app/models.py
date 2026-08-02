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