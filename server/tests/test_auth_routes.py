from fastapi.testclient import TestClient
from main import app
from api.dependencies import get_registrar_usuario_use_case, get_autenticar_usuario_use_case
from application.use_cases.auth.registrar_usuario import RegistrarUsuarioUseCase
from application.use_cases.auth.autenticar_usuario import AutenticarUsuarioUseCase
from tests.test_auth_use_cases import InMemoryUsuarioRepository

client = TestClient(app)

def test_route_register_e_login_e2e():
    in_memory_repo = InMemoryUsuarioRepository()

    app.dependency_overrides[get_registrar_usuario_use_case] = lambda: RegistrarUsuarioUseCase(in_memory_repo)
    app.dependency_overrides[get_autenticar_usuario_use_case] = lambda: AutenticarUsuarioUseCase(in_memory_repo)

    # 1. Registro
    res = client.post("/auth/register", json={
        "nome": "Samuel Teste",
        "email": "samuel@teste.com",
        "telefone": "86999998888",
        "senha": "senhaSegura123"
    })
    assert res.status_code == 201
    dados = res.json()
    assert dados["access_token"] is not None
    assert dados["usuario"]["email"] == "samuel@teste.com"

    # 2. Conflito de email
    res_conflito = client.post("/auth/register", json={
        "nome": "Samuel Teste",
        "email": "samuel@teste.com",
        "telefone": "86999998888",
        "senha": "senhaSegura123"
    })
    assert res_conflito.status_code == 409
    assert res_conflito.json()["detail"] == "E-mail já cadastrado"

    # 3. Login
    res_login = client.post("/auth/login", json={
        "email": "samuel@teste.com",
        "senha": "senhaSegura123"
    })
    assert res_login.status_code == 200
    assert res_login.json()["access_token"] is not None

    # 4. Login com senha errada
    res_login_erro = client.post("/auth/login", json={
        "email": "samuel@teste.com",
        "senha": "senhaErrada123"
    })
    assert res_login_erro.status_code == 401

    app.dependency_overrides.clear()
