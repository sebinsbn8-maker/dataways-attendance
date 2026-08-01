from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
import io
import csv
from .. import models
from ..database import get_db
from ..dependencies import require_admin

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export")
def export_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    employee_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    output = io.StringIO()
    writer = csv.writer(output)

    all_employees = {e.id: e for e in db.query(models.Employee).all()}

    writer.writerow(["ATTENDANCE / SHIFT LOG"])
    writer.writerow(["Employee ID", "Employee Name", "Date", "Shift Type", "Check In", "Check Out", "Hours", "Project", "System Type", "Remarks"])

    entries_query = db.query(models.ShiftEntry).filter(
        models.ShiftEntry.date >= start_date,
        models.ShiftEntry.date <= end_date,
    )
    if employee_id:
        entries_query = entries_query.filter(models.ShiftEntry.employee_id == employee_id)

    for e in entries_query.order_by(models.ShiftEntry.date).all():
        emp = all_employees.get(e.employee_id)
        writer.writerow([
            emp.employee_id if emp else "",
            emp.name if emp else "",
            e.date,
            e.shift_type,
            e.check_in or "",
            e.check_out or "",
            e.hours or 0,
            e.project_name or "",
            e.system_type or "",
            e.remarks or "",
        ])

    writer.writerow([])
    writer.writerow(["LEAVE RECORDS"])
    writer.writerow(["Employee ID", "Employee Name", "Start Date", "End Date", "Reason", "Status"])

    leave_query = db.query(models.Leave).filter(
        models.Leave.start_date <= end_date,
        models.Leave.end_date >= start_date,
    )
    if employee_id:
        leave_query = leave_query.filter(models.Leave.employee_id == employee_id)

    for l in leave_query.order_by(models.Leave.start_date).all():
        emp = all_employees.get(l.employee_id)
        writer.writerow([
            emp.employee_id if emp else "",
            emp.name if emp else "",
            l.start_date,
            l.end_date,
            l.reason or "",
            l.status,
        ])

    output.seek(0)
    filename = f"dataways_report_{start_date}_to_{end_date}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )