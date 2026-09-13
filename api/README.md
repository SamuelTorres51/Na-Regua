cd api
python -m venv .venv
.venv\Scripts\activate
pip install -e .

.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --app-dir src

## Banco de dados e migrações

Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para o banco local.

```powershell
alembic upgrade head
alembic revision --autogenerate -m "descricao da alteracao"
alembic upgrade head
```