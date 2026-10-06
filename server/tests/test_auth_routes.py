from fastapi.testclient import TestClient
from main import app
from api.dependencies import (
    get_registrar_usuario_use_case,
    get_autenticar_usuario_use_case,
    get_alterar_senha_use_case,
    get_usuario_repository,
)
from application.use_cases.auth.registrar_usuario import RegistrarUsuarioUseCase
from application.use_cases.auth.autenticar_usuario import AutenticarUsuarioUseCase
from application.use_cases.auth.alterar_senha import AlterarSenhaUseCase
from tests.test_auth_use_cases import InMemoryUsuarioRepository

client = TestClient(app)

def test_route_register_e_login_e2e():
    in_memory_repo = InMemoryUsuarioRepository()

    app.dependency_overrides[get_usuario_repository] = lambda: in_memory_repo
    app.dependency_overrides[get_registrar_usuario_use_case] = lambda: RegistrarUsuarioUseCase(in_memory_repo)
    app.dependency_overrides[get_autenticar_usuario_use_case] = lambda: AutenticarUsuarioUseCase(in_memory_repo)
    app.dependency_overrides[get_alterar_senha_use_case] = lambda: AlterarSenhaUseCase(in_memory_repo)

    # 1. Registro
    res = client.post("/auth/register", json={
        "nome": "Samuel Teste",
        "email": "samuel@teste.com",
        "telefone": "86999998888",
        "senha": "senhaSegura123"
    })
    assert res.status_code == 201
    dados = res.json()
    token = dados["access_token"]
    assert token is not None
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

    # 5. Alterar senha com senha atual errada
    headers = {"Authorization": f"Bearer {token}"}
    res_alt_err = client.put("/auth/alterar-senha", json={
        "senha_atual": "senhaErrada",
        "nova_senha": "novaSenhaSegura999"
    }, headers=headers)
    assert res_alt_err.status_code == 400

    # 6. Alterar senha com sucesso
    res_alt = client.put("/auth/alterar-senha", json={
        "senha_atual": "senhaSegura123",
        "nova_senha": "novaSenhaSegura999"
    }, headers=headers)
    assert res_alt.status_code == 200
    assert res_alt.json()["mensagem"] == "Senha alterada com sucesso."

    # 7. Login com a nova senha
    res_login_novo = client.post("/auth/login", json={
        "email": "samuel@teste.com",
        "senha": "novaSenhaSegura999"
    })
    assert res_login_novo.status_code == 200

    app.dependency_overrides.clear()
