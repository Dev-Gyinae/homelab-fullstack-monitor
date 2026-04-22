import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

broker_url = os.getenv("CELERY_BROKER_URL", "pyamqp://guest@localhost//")

celery_app = Celery(
    "homelab_tasks",
    broker=broker_url,
    backend="rpc://",
    include=["app.tasks"]   # will import tasks module
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
