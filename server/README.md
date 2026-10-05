# Na Régua API

API da plataforma Na Régua, desenvolvida com FastAPI, SQLAlchemy e
PostgreSQL.

## Requisitos

- Python 3.12 ou superior
- Docker Desktop
- Docker Compose
- PowerShell no Windows ou shell compatível no Linux

## Configuração

Na pasta `server`, crie o ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual.

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Linux:

```bash
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -e .
```

Copie o arquivo de exemplo para criar o arquivo de ambiente local:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux:

```bash
cp .env.example .env
```

No arquivo `.env`, configure a URL do PostgreSQL e uma chave JWT secreta.
A URL usada pelo `docker-compose.yml` é:

```env
DATABASE_URL=postgresql+psycopg://naregua_user:naregua_pass@localhost:5432/naregua_db
JWT_SECRET_KEY=chave-secreta-com-pelo-menos-32-caracteres
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30
```

O arquivo `.env` não deve ser versionado.

## Banco de dados e migrations

Inicie o PostgreSQL:

```bash
docker compose up -d
```

Verifique o estado do container:

```bash
docker compose ps
```

Aplique as migrations:

```bash
alembic upgrade head
```

Confira a versão aplicada:

```bash
alembic current
```

Para criar uma nova migration depois de alterar os modelos:

```bash
alembic revision --autogenerate -m "descricao da alteracao"
alembic upgrade head
```

## Executando a API

Com o ambiente virtual ativado:

```bash
python -m uvicorn main:app --reload --app-dir src
```

A API estará disponível em `http://127.0.0.1:8000`.

Documentação interativa:

- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Autenticação

### Cadastro

`POST /auth/register`

```json
{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "telefone": "86999999999",
  "senha": "segura123"
}
```

O cadastro retorna um access token e os dados públicos do usuário. A senha
é armazenada somente como hash.

### Login

`POST /auth/login`

```json
{
  "email": "maria@example.com",
  "senha": "segura123"
}
```

### Usuário autenticado

`GET /auth/me`

Envie o token retornado pelo cadastro ou login no header:

```text
Authorization: Bearer <access_token>
```

O backend valida o formato do e-mail, a senha, a assinatura e a expiração
do JWT, além de verificar se o usuário está ativo.

## Health check

`GET /health`

Resposta esperada:

```json
{
  "status": "ok"
}
```
