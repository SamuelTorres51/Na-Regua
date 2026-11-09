from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
import pytest
from fastapi.testclient import TestClient

from api.dependencies import (
    get_contar_notificacoes_nao_lidas_use_case,
    get_current_user,
    get_listar_notificacoes_use_case,
    get_marcar_notificacao_lida_use_case,
    get_processar_lembretes_use_case,
)
from application.use_cases.notificacoes.contar_notificacoes_nao_lidas import (
    ContarNotificacoesNaoLidasUseCase,
)
from application.use_cases.notificacoes.listar_notificacoes import (
    ListarNotificacoesUseCase,
)
from application.use_cases.notificacoes.marcar_notificacao_lida import (
    MarcarNotificacaoLidaUseCase,
)
from application.use_cases.notificacoes.processar_lembretes import (
    ProcessarLembretesUseCase,
)
from domain.entities.administrador import Administrador
from domain.entities.agendamento import Agendamento
from domain.entities.cliente import Cliente
from domain.entities.notificacao import Notificacao
from domain.entities.servico import Servico
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.enums.tipo_notificacao import TipoNotificacao
from main import app
from tests.test_notificacoes_use_cases import (
    FakeAgendamentoRepository,
    FakeServicoRepository,
    InMemoryNotificacaoRepository,
)

client = TestClient(app)
FORTALEZA_TZ = ZoneInfo("America/Fortaleza")


def _criar_cliente(id: int = 1) -> Cliente:
    return Cliente(
        id=id,
        nome=f"Cliente {id}",
        email=f"cliente{id}@exemplo.com",
        telefone="86999990001",
        senha_hash="hash",
        perfil=PerfilAcesso.CLIENTE,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def _criar_admin() -> Administrador:
    return Administrador(
        id=99,
        nome="Admin Barbearia",
        email="admin@naregua.com",
        telefone="86999990099",
        senha_hash="hash",
        perfil=PerfilAcesso.ADMINISTRADOR,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def test_listar_notificacoes_do_usuario():
    repo = InMemoryNotificacaoRepository()
    agora = datetime.now(timezone.utc)

    # Notificações para o cliente 1
    repo.criar(
        Notificacao(
            id=None,
            usuario_id=1,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="Agendamento confirmado",
            enviada_em=agora - timedelta(minutes=10),
            lida=False,
        )
    )
    repo.criar(
        Notificacao(
            id=None,
            usuario_id=1,
            tipo=TipoNotificacao.LEMBRETE_AGENDAMENTO,
            mensagem="Lembrete de horário",
            enviada_em=agora,
            lida=True,
        )
    )
    # Notificação para outro cliente (cliente 2)
    repo.criar(
        Notificacao(
            id=None,
            usuario_id=2,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="Outro agendamento",
            enviada_em=agora,
            lida=False,
        )
    )

    app.dependency_overrides[get_current_user] = lambda: _criar_cliente(1)
    app.dependency_overrides[get_listar_notificacoes_use_case] = (
        lambda: ListarNotificacoesUseCase(repo)
    )

    try:
        # 1. Todas as notificações do usuário 1
        res = client.get("/notificacoes")
        assert res.status_code == 200
        dados = res.json()
        assert len(dados) == 2
        assert dados[0]["usuario_id"] == 1
        assert dados[1]["usuario_id"] == 1

        # 2. Apenas não lidas
        res_nao_lidas = client.get("/notificacoes?apenas_nao_lidas=true")
        assert res_nao_lidas.status_code == 200
        dados_nl = res_nao_lidas.json()
        assert len(dados_nl) == 1
        assert dados_nl[0]["tipo"] == TipoNotificacao.CONFIRMACAO_AGENDAMENTO.value
        assert dados_nl[0]["lida"] is False
    finally:
        app.dependency_overrides.clear()


def test_contar_notificacoes_nao_lidas():
    repo = InMemoryNotificacaoRepository()
    agora = datetime.now(timezone.utc)

    repo.criar(
        Notificacao(
            id=None,
            usuario_id=1,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="Mensagem 1",
            enviada_em=agora,
            lida=False,
        )
    )
    repo.criar(
        Notificacao(
            id=None,
            usuario_id=1,
            tipo=TipoNotificacao.NOVO_AGENDAMENTO,
            mensagem="Mensagem 2",
            enviada_em=agora,
            lida=False,
        )
    )
    repo.criar(
        Notificacao(
            id=None,
            usuario_id=1,
            tipo=TipoNotificacao.LEMBRETE_AGENDAMENTO,
            mensagem="Mensagem 3",
            enviada_em=agora,
            lida=True,
        )
    )

    app.dependency_overrides[get_current_user] = lambda: _criar_cliente(1)
    app.dependency_overrides[get_contar_notificacoes_nao_lidas_use_case] = (
        lambda: ContarNotificacoesNaoLidasUseCase(repo)
    )

    try:
        res = client.get("/notificacoes/nao-lidas/count")
        assert res.status_code == 200
        assert res.json() == {"total_nao_lidas": 2}
    finally:
        app.dependency_overrides.clear()


def test_marcar_notificacao_como_lida_sucesso():
    repo = InMemoryNotificacaoRepository()
    agora = datetime.now(timezone.utc)

    notif = repo.criar(
        Notificacao(
            id=None,
            usuario_id=1,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="Confirmado!",
            enviada_em=agora,
            lida=False,
        )
    )

    app.dependency_overrides[get_current_user] = lambda: _criar_cliente(1)
    app.dependency_overrides[get_marcar_notificacao_lida_use_case] = (
        lambda: MarcarNotificacaoLidaUseCase(repo)
    )

    try:
        res = client.patch(f"/notificacoes/{notif.id}/ler")
        assert res.status_code == 200
        dados = res.json()
        assert dados["id"] == notif.id
        assert dados["lida"] is True
    finally:
        app.dependency_overrides.clear()


def test_marcar_notificacao_outro_usuario_retorna_403():
    repo = InMemoryNotificacaoRepository()
    agora = datetime.now(timezone.utc)

    # Notificação pertence ao usuario 2
    notif = repo.criar(
        Notificacao(
            id=None,
            usuario_id=2,
            tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
            mensagem="Confirmado!",
            enviada_em=agora,
            lida=False,
        )
    )

    # Usuário logado é o cliente 1
    app.dependency_overrides[get_current_user] = lambda: _criar_cliente(1)
    app.dependency_overrides[get_marcar_notificacao_lida_use_case] = (
        lambda: MarcarNotificacaoLidaUseCase(repo)
    )

    try:
        res = client.patch(f"/notificacoes/{notif.id}/ler")
        assert res.status_code == 403
        assert "não tem permissão" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


def test_marcar_notificacao_inexistente_retorna_404():
    repo = InMemoryNotificacaoRepository()

    app.dependency_overrides[get_current_user] = lambda: _criar_cliente(1)
    app.dependency_overrides[get_marcar_notificacao_lida_use_case] = (
        lambda: MarcarNotificacaoLidaUseCase(repo)
    )

    try:
        res = client.patch("/notificacoes/9999/ler")
        assert res.status_code == 404
        assert "não encontrada" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


def test_processar_lembretes_cliente_bloqueado():
    app.dependency_overrides[get_current_user] = lambda: _criar_cliente(1)

    try:
        res = client.post("/notificacoes/processar-lembretes", json={"janela_horas": 2})
        assert res.status_code == 403
        assert "apenas administradores" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


def test_processar_lembretes_admin_sucesso():
    notif_repo = InMemoryNotificacaoRepository()
    agendamento_repo = FakeAgendamentoRepository()
    servico = Servico(
        id=3,
        nome="Corte Degradê",
        descricao="",
        duracao_minutos=30,
        preco=50.0,
    )
    servico_repo = FakeServicoRepository([servico])

    agora = datetime.now(FORTALEZA_TZ)
    # Agendamento daqui a 1 hora (dentro da janela de 2h)
    agendamento = Agendamento(
        id=None,
        cliente_id=1,
        profissional_id=2,
        servico_id=3,
        inicio=agora + timedelta(hours=1),
        duracao_minutos=30,
        status=StatusAgendamento.AGENDADO,
    )
    agendamento_repo.criar(agendamento)

    use_case = ProcessarLembretesUseCase(
        agendamento_repository=agendamento_repo,
        servico_repository=servico_repo,
        notificacao_repository=notif_repo,
    )

    app.dependency_overrides[get_current_user] = _criar_admin
    app.dependency_overrides[get_processar_lembretes_use_case] = lambda: use_case

    try:
        res = client.post("/notificacoes/processar-lembretes", json={"janela_horas": 2})
        assert res.status_code == 200
        dados = res.json()
        assert dados["total_processados"] == 1
        assert len(dados["notificacoes"]) == 1
        notif = dados["notificacoes"][0]
        assert notif["tipo"] == TipoNotificacao.LEMBRETE_AGENDAMENTO.value
        assert notif["usuario_id"] == 1
        assert notif["agendamento_id"] == 1
    finally:
        app.dependency_overrides.clear()
