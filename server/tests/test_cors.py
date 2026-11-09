from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

ORIGEM_PAINEL = "http://localhost:5173"


def test_preflight_libera_origem_do_painel_web():
    res = client.options(
        "/auth/login",
        headers={
            "Origin": ORIGEM_PAINEL,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization, content-type",
        },
    )

    assert res.status_code == 200
    assert res.headers["access-control-allow-origin"] == ORIGEM_PAINEL
    assert "POST" in res.headers["access-control-allow-methods"]
    allowed_headers = res.headers["access-control-allow-headers"].lower()
    assert "authorization" in allowed_headers
    assert "content-type" in allowed_headers


def test_resposta_inclui_cabecalho_cors_para_origem_permitida():
    res = client.get("/health", headers={"Origin": ORIGEM_PAINEL})

    assert res.status_code == 200
    assert res.headers["access-control-allow-origin"] == ORIGEM_PAINEL


def test_preflight_recusa_origem_nao_configurada():
    res = client.options(
        "/auth/login",
        headers={
            "Origin": "http://site-desconhecido.com",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert res.status_code == 400
    assert "access-control-allow-origin" not in res.headers
