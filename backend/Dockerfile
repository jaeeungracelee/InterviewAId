FROM python:3.12-slim-bullseye
WORKDIR /backend_api

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app_sio", "--host", "0.0.0.0", "--port", "8000"]