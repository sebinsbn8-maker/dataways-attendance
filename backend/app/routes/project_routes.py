from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_admin

router = APIRouter(prefix="/projects", tags=["Projects"])


def to_detail(project: models.Project) -> schemas.ProjectDetailOut:
    return schemas.ProjectDetailOut(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        instructions=project.instructions,
        link=project.link,
        employees=[
            schemas.ProjectEmployeeOut(id=e.id, name=e.name, employee_id=e.employee_id)
            for e in project.employees
        ],
    )


def hours_for(db: Session, employee_id: int, project_name: str) -> float:
    entries = db.query(models.ShiftEntry).filter(
        models.ShiftEntry.employee_id == employee_id,
        models.ShiftEntry.project_name == project_name,
    ).all()
    return sum(e.hours for e in entries)


@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(require_admin),
):
    existing = db.query(models.Project).filter(models.Project.name == project.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A project with this name already exists")
    new_project = models.Project(
        name=project.name,
        description=project.description,
        status=project.status or "Active",
        instructions=project.instructions,
        link=project.link,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/", response_model=List[schemas.ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    return db.query(models.Project).order_by(models.Project.name).all()


@router.get("/assigned", response_model=List[schemas.ProjectOut])
def assigned_projects(
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    target_id = current_user.id
    if current_user.role == "Admin" and employee_id:
        target_id = employee_id
    employee = db.query(models.Employee).filter(models.Employee.id == target_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee.projects


@router.get("/my", response_model=List[schemas.MyProjectOut])
def my_projects(
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    result = []
    for p in current_user.projects:
        result.append(schemas.MyProjectOut(
            id=p.id,
            name=p.name,
            description=p.description,
            status=p.status,
            instructions=p.instructions,
            link=p.link,
            hours_worked=hours_for(db, current_user.id, p.name),
        ))
    return result


@router.get("/{project_id}", response_model=schemas.ProjectDetailOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(get_current_user),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return to_detail(project)


@router.put("/{project_id}", response_model=schemas.ProjectDetailOut)
def update_project(
    project_id: int,
    update: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if update.description is not None:
        project.description = update.description
    if update.status is not None:
        project.status = update.status
    if update.instructions is not None:
        project.instructions = update.instructions
    if update.link is not None:
        project.link = update.link
    db.commit()
    db.refresh(project)
    return to_detail(project)


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


@router.post("/{project_id}/assign", response_model=schemas.ProjectDetailOut)
def assign_employee(
    project_id: int,
    body: schemas.ProjectAssignRequest,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    employee = db.query(models.Employee).filter(models.Employee.id == body.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if employee not in project.employees:
        project.employees.append(employee)
        db.commit()
        db.refresh(project)
    return to_detail(project)


@router.delete("/{project_id}/unassign/{employee_id}", response_model=schemas.ProjectDetailOut)
def unassign_employee(
    project_id: int,
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if employee and employee in project.employees:
        project.employees.remove(employee)
        db.commit()
        db.refresh(project)
    return to_detail(project)


@router.get("/{project_id}/overview", response_model=schemas.ProjectOverview)
def project_overview(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.Employee = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    assigned_ids = [e.id for e in project.employees]

    entries = db.query(models.ShiftEntry).filter(
        models.ShiftEntry.project_name == project.name,
        models.ShiftEntry.employee_id.in_(assigned_ids) if assigned_ids else False,
    ).all()

    hours_by_employee = {}
    for e in entries:
        hours_by_employee[e.employee_id] = hours_by_employee.get(e.employee_id, 0) + e.hours

    by_employee = []
    total_hours = 0
    for emp in project.employees:
        h = hours_by_employee.get(emp.id, 0)
        by_employee.append(schemas.ProjectOverviewEntry(employee_id=emp.id, employee_name=emp.name, hours=h))
        total_hours += h

    return schemas.ProjectOverview(
        project_id=project.id,
        project_name=project.name,
        total_hours=total_hours,
        by_employee=by_employee,
    )