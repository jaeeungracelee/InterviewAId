To run backend, go to src/:


`python -m venv venv`

`source venv/bin/activate`

`venv\Scripts\activate` (on Windows)

`pip install -r requirements.txt`

`uvicorn app:app --host 0.0.0.0 --port 8000`