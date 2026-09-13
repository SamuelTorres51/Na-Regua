cd api
python -m venv .venv
.venv\Scripts\activate
pip install -e .

.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --app-dir src