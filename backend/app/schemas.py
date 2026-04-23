from pydantic import BaseModel
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None

class Task(TaskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
