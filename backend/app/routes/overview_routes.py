from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date as date_type
from calendar import monthrange
from .. import models
from ..database import get_db
from ..dependencies import require_admin

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("/")
def get_overview(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    today = date_type.today()
    target_year = year or today.year
    target_month = month or today.month

    month_start = date_type(target_year, target_month, 1)
    month_end = date_type(target_year, target_month, monthrange(target_year, target_month)[1])

    # Total work hours per employee for the selected month
    employees = db.query(models.Employee).all()
    employee_hours = []
    for emp in employees:
        entries = db.query(models.ShiftEntry).filter(
            models.ShiftEntry.employee_id == emp.id,
            models.ShiftEntry.date >= month_start,
            models.ShiftEntry.date <= month_end,
        ).all()
        total = sum(e.hours for e in entries)
        employee_hours.append({
            "employee_id": emp.id,
            "employee_code": emp.employee_id,
            "name": emp.name,
            "department": emp.department,
            "total_hours": total,
        })
    employee_hours.sort(key=lambda x: x["total_hours"], reverse=True)

    # Contributors added
    contributors = db.query(models.ContributorDatabase).all()
    contributor_details = [
        {
            "id": c.id,
            "company_name": c.company_name,
            "industry_type": c.industry_type,
            "participation_status": c.participation_status,
            "field_visited_date": str(c.field_visited_date) if c.field_visited_date else None,
        }
        for c in contributors
    ]
    interested_count = sum(1 for c in contributors if c.participation_status == "Interested")
    not_interested_count = sum(1 for c in contributors if c.participation_status == "Not Interested")

    # Projects status breakdown + hours per project (for selected month)
    projects = db.query(models.Project).all()
    active_count = sum(1 for p in projects if p.status == "Active")
    completed_count = sum(1 for p in projects if p.status == "Completed")
    on_hold_count = sum(1 for p in projects if p.status == "On Hold")

    project_hours = []
    for p in projects:
        entries = db.query(models.ShiftEntry).filter(
            models.ShiftEntry.project_name == p.name,
            models.ShiftEntry.date >= month_start,
            models.ShiftEntry.date <= month_end,
        ).all()
        total = sum(e.hours for e in entries)
        project_hours.append({
            "project_id": p.id,
            "project_name": p.name,
            "status": p.status,
            "total_hours": total,
        })
    project_hours.sort(key=lambda x: x["total_hours"], reverse=True)

    return {
        "year": target_year,
        "month": target_month,
        "employee_hours": employee_hours,
        "contributors": {
            "total_count": len(contributors),
            "interested_count": interested_count,
            "not_interested_count": not_interested_count,
            "details": contributor_details,
        },
        "projects": {
            "active_count": active_count,
            "completed_count": completed_count,
            "on_hold_count": on_hold_count,
            "total_count": len(projects),
            "hours_by_project": project_hours,
        },
    }