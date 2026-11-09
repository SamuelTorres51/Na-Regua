from datetime import datetime, timezone

from fastapi.testclient import TestClient

from api.dependencies import (
    get_atualizar_status_agendamento_use_case,
    get_current_user,
)
from application.use_cases.agendamentos.atualizar_status_agendamento import (
    AtualizarStatusAgendamentoUseCase,
)
from domain.entities.agendamento import Agendamento
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from main import app

client = TestClient(app)


class InMemoryAgendamentoRepository(AgendamentoRepository):
    def __init__(self, agendamento: Agendamento | None) -> None:
        self.agendamento = agendamento

    def criar(self, agendamento: Agendamento) -> Agendamento:
        self.agendamento = agendamento
        return agendamento

    def buscar_por_id(self, agendamento_id: int) -> Agendamento | None:
        if self.agendamento is None or self.agendamento.id != agendamento_id:
            return None
        return self.agendamento

    def atualizar_status(
        self,
        agendamento_id: int,
        status: StatusAgendamento,
    ) -> Agendamento | None:
        agendamento = self.buscar_por_id(agendamento_id)
        if agendamento is None:
            return None
        agendamento.status = status
        return agendamento

    def listar(self, **kwargs) -> list[Agendamento]:
        return [self.agendamento] if self.agendamento is not None else []

    def existe_conflito_profissional(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        return False

    def existe_conflito_cliente(
        self,
        cliente_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        return False


def _usuario(usuario_id: int, perfil: PerfilAcesso) -> Usuario:
    return Usuario(
        id=usuario_id,
        nome=f"Usuário {usuario_id}",
        email=f"usuario{usuario_id}@example.com",
        telefone="86999999999",
        senha_hash="hash",
        perfil=perfil,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def _agendamento(
    status: StatusAgendamento = StatusAgendamento.AGENDADO,
) -> Agendamento:
    return Agendamento(
        id=10,
        cliente_id=1,
        profissional_id=2,
        servico_id=3,
        inicio=datetime.now(timezone.utc),
        duracao_minutos=30,
        status=status,
    )


def _configurar(
    agendamento: Agendamento | None,
    usuario: Usuario,
) -> None:
    repository = InMemoryAgendamentoRepository(
        agendamento if agendamento is not None else _agendamento()
    )
    if agendamento is None:
        repository.agendamento = None
    app.dependency_overrides[get_current_user] = lambda: usuario
    app.dependency_overrides[
        get_atualizar_status_agendamento_use_case
    ] = lambda: AtualizarStatusAgendamentoUseCase(repository)


def test_endpoint_atualiza_status_e_retorna_agendamento() -> None:
    agendamento = _agendamento()
    _configurar(agendamento, _usuario(2, PerfilAcesso.PROFISSIONAL))

    try:
        response = client.patch(
            "/agendamentos/10/status",
            json={"status": "confirmado"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["id"] == 10
    assert response.json()["status"] == "confirmado"
    assert agendamento.status == StatusAgendamento.CONFIRMADO


def test_endpoint_retorna_403_para_usuario_sem_permissao() -> None:
    _configurar(_agendamento(), _usuario(1, PerfilAcesso.CLIENTE))

    try:
        response = client.patch(
            "/agendamentos/10/status",
            json={"status": "confirmado"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403


def test_endpoint_retorna_404_para_agendamento_inexistente() -> None:
    _configurar(None, _usuario(2, PerfilAcesso.PROFISSIONAL))

    try:
        response = client.patch(
            "/agendamentos/10/status",
            json={"status": "confirmado"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404


def test_endpoint_retorna_409_para_transicao_invalida() -> None:
    _configurar(
        _agendamento(StatusAgendamento.CONCLUIDO),
        _usuario(2, PerfilAcesso.PROFISSIONAL),
    )

    try:
        response = client.patch(
            "/agendamentos/10/status",
            json={"status": "confirmado"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 409


def test_endpoint_retorna_422_para_status_invalido() -> None:
    _configurar(_agendamento(), _usuario(2, PerfilAcesso.PROFISSIONAL))

    try:
        response = client.patch(
            "/agendamentos/10/status",
            json={"status": "status_invalido"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422
