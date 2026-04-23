import os
from elasticsearch import Elasticsearch
from worker.celery_app import celery_app
from dotenv import load_dotenv

load_dotenv()

es_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
es = Elasticsearch([es_url])

@celery_app.task(name="app.tasks.index_task")
def index_task(task_id: int, title: str, completed: bool = False):
    """Index a task document in Elasticsearch."""
    doc = {
        "id": task_id,
        "title": title,
        "completed": completed
    }
    try:
        es.index(index="tasks", id=task_id, body=doc)
        return f"Task {task_id} indexed successfully"
    except Exception as e:
        return f"Failed to index task {task_id}: {str(e)}"
