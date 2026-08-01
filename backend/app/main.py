from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routes import auth_routes, employee_routes, shift_routes, leave_routes, shift_entry_routes

app = FastAPI(title="Dataways Attendance Management System")

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(employee_routes.router)
app.include_router(shift_routes.router)
app.include_router(leave_routes.router)
app.include_router(shift_entry_routes.router)

@app.get("/")
def read_root():
    return {"message": "Dataways Attendance API is running"}