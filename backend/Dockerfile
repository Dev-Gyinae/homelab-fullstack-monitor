FROM python:3.12-slim

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "python -c 'from app.database import engine; from app import models; models.Base.metadata.create_all(bind=engine)' && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
