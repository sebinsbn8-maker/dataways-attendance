from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from . import models
from .database import engine
from .routes import auth_routes, employee_routes, shift_routes, leave_routes, shift_entry_routes, reports_routes, project_routes, notification_routes, contributor_routes, overview_routes

app = FastAPI(title="Dataways Attendance Management System")

models.Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS instructions TEXT"))
    conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS link VARCHAR"))
    conn.commit()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dataways-attendance.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(employee_routes.router)
app.include_router(shift_routes.router)
app.include_router(leave_routes.router)
app.include_router(shift_entry_routes.router)
app.include_router(reports_routes.router)
app.include_router(project_routes.router)
app.include_router(notification_routes.router)
app.include_router(contributor_routes.router)
app.include_router(overview_routes.router)

@app.get("/")
def read_root():
    return {"message": "Dataways Attendance API is running"}