FROM python:3.12.10-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN mkdir /app

WORKDIR /app

COPY requirements.txt /app
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12.10-slim

RUN useradd -m -u 1000 appuser
RUN mkdir /app
RUN chown -R appuser /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

WORKDIR /app

COPY --chown=appuser:appuser . .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

USER appuser

EXPOSE 8000

# CMD ["gunicorn", "backend_project.wsgi", "--bind=0.0.0.0:8000"]
# TODO: Use asynchronous server for production
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]