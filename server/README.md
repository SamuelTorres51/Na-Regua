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
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

`CORS_ORIGINS` lista as origens que podem chamar a API pelo navegador, como o
painel web. Sem a variável, são liberadas as origens do Vite em
desenvolvimento (`localhost:5173` e `127.0.0.1:5173`).

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

## Horários e disponibilidade

Nenhum horário fica gravado: a disponibilidade é calculada a partir do
funcionamento da barbearia, da jornada do profissional e dos agendamentos
ativos. Um horário só é oferecido quando o serviço inteiro cabe no expediente,
então um serviço de 45 minutos não aparece às 8:30 se houver outro atendimento
às 9:00.

### Funcionamento da barbearia

`GET /barbearia/horarios` e `PUT /barbearia/horarios` (apenas administrador)

```json
{
  "turnos": [
    { "diaSemana": "segunda", "inicio": "08:00", "fim": "12:00" },
    { "diaSemana": "segunda", "inicio": "14:00", "fim": "18:00" }
  ]
}
```

A pausa do almoço são dois turnos no mesmo dia. Dia sem turno é dia fechado.
A migration já cria segunda a sábado, das 08:00 às 12:00 e das 14:00 às 18:00.

### Jornada do profissional

`GET /profissionais/{id}/jornada` e `PUT /profissionais/{id}/jornada`
(apenas administrador), com o mesmo formato de `turnos`.

Com `"turnos": null`, o profissional segue o horário integral da barbearia.
Com uma lista, vale só a jornada própria, limitada ao funcionamento da
barbearia, e dia sem turno é folga.

### Horários disponíveis

`GET /profissionais/{id}/disponibilidade?servico_id=1&de=2026-11-16&ate=2026-11-30`

```json
[
  {
    "data": "2026-11-16",
    "status": "disponivel",
    "horarios": ["2026-11-16T08:00:00-03:00", "2026-11-16T08:30:00-03:00"]
  },
  { "data": "2026-11-22", "status": "fechado", "horarios": [] }
]
```

`status` pode ser `disponivel`, `lotado`, `folga` ou `fechado`. Os horários
seguem uma grade de 30 minutos e também encaixam logo depois de um atendimento
que termina fora dela. O período é limitado a hoje e aos próximos 15 dias.

## Health check

`GET /health`

Resposta esperada:

```json
{
  "status": "ok"
}
```
