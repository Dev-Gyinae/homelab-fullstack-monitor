import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

from . import models, schemas
from .database import engine, get_db
from .tasks import index_task

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Homelab Task API", version="0.2.0")

es_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
es = Elasticsearch([es_url])

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/tasks", response_model=schemas.Task, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(title=task.title, completed=task.completed)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    index_task.delay(db_task.id, db_task.title, db_task.completed)
    return db_task

@app.get("/api/tasks", response_model=list[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).order_by(models.Task.id.desc()).offset(skip).limit(limit).all()
    return tasks

@app.patch("/api/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    db.commit()
    db.refresh(db_task)
    index_task.delay(db_task.id, db_task.title, db_task.completed)
    return db_task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    # Optionally delete from Elasticsearch
    try:
        es.delete(index="tasks", id=task_id, ignore=[404])
    except:
        pass
    return {"ok": True}

@app.get("/api/search")
def search_tasks(q: str):
    try:
        res = es.search(index="tasks", body={
            "query": {
                "match": {
                    "title": q
                }
            }
        })
        hits = res["hits"]["hits"]
        return [{"id": hit["_source"]["id"], "title": hit["_source"]["title"], "completed": hit["_source"].get("completed", False)} for hit in hits]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
