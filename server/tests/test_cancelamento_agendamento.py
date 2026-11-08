from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from api.dependencies import (
    get_cancelar_agendamento_use_case,
    get_current_user,
)
from application.common.exceptions import (
    AgendamentoNaoEncontradoError,
    AgendamentoNaoPermitidoError,
    AgendamentoNaoPodeSerCanceladoError,
    ValidationError,
)
from application.use_cases.agendamentos.cancelar_agendamento import (
    CancelarAgendamentoInput,
    CancelarAgendamentoUseCase,
)
from domain.entities.agendamento import Agendamento
from domain.entities.cancelamento import Cancelamento
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.cancelamento_repository import CancelamentoRepository
from main import app


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


class InMemoryCancelamentoRepository(CancelamentoRepository):
    def __init__(self) -> None:
        self.cancelamentos: list[Cancelamento] = []

    def criar(self, cancelamento: Cancelamento) -> Cancelamento:
        criado = Cancelamento(
            id=len(self.cancelamentos) + 1,
            agendamento_id=cancelamento.agendamento_id,
            autor_id=cancelamento.autor_id,
            motivo=cancelamento.motivo,
            cancelado_em=cancelamento.cancelado_em,
        )
        self.cancelamentos.append(criado)
        return criado

    def buscar_por_agendamento_id(
        self,
        agendamento_id: int,
    ) -> Cancelamento | None:
        return next(
            (
                cancelamento
                for cancelamento in self.cancelamentos
                if cancelamento.agendamento_id == agendamento_id
            ),
            None,
        )


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
    *,
    status: StatusAgendamento = StatusAgendamento.AGENDADO,
    inicio: datetime | None = None,
) -> Agendamento:
    return Agendamento(
        id=10,
        cliente_id=1,
        profissional_id=2,
        servico_id=3,
        inicio=inicio or datetime.now(timezone.utc) + timedelta(hours=2),
        duracao_minutos=30,
        status=status,
    )


def _caso(
    agendamento: Agendamento | None = None,
) -> tuple[
    CancelarAgendamentoUseCase,
    InMemoryAgendamentoRepository,
    InMemoryCancelamentoRepository,
]:
    agendamento_repository = InMemoryAgendamentoRepository(
        agendamento or _agendamento()
    )
    cancelamento_repository = InMemoryCancelamentoRepository()
    return (
        CancelarAgendamentoUseCase(
            agendamento_repository,
            cancelamento_repository,
        ),
        agendamento_repository,
        cancelamento_repository,
    )


def test_cancela_agendamento_e_registra_autor_motivo_e_data() -> None:
    caso, agendamento_repository, cancelamento_repository = _caso()
    cliente = _usuario(1, PerfilAcesso.CLIENTE)

    cancelamento = caso.execute(
        CancelarAgendamentoInput(10, "Cliente solicitou o cancelamento"),
        cliente,
    )

    assert cancelamento.id == 1
    assert cancelamento.agendamento_id == 10
    assert cancelamento.autor_id == cliente.id
    assert cancelamento.motivo == "Cliente solicitou o cancelamento"
    assert cancelamento.cancelado_em.tzinfo is not None
    assert agendamento_repository.agendamento.status == StatusAgendamento.CANCELADO
    assert cancelamento_repository.buscar_por_agendamento_id(10) == cancelamento


def test_rejeita_cancelamento_por_usuario_sem_permissao() -> None:
    caso, _, _ = _caso()

    with pytest.raises(AgendamentoNaoPermitidoError):
        caso.execute(
            CancelarAgendamentoInput(10, "Motivo"),
            _usuario(99, PerfilAcesso.CLIENTE),
        )


def test_permite_cancelamento_pelo_profissional_do_agendamento() -> None:
    caso, _, _ = _caso()

    cancelamento = caso.execute(
        CancelarAgendamentoInput(10, "Imprevisto profissional"),
        _usuario(2, PerfilAcesso.PROFISSIONAL),
    )

    assert cancelamento.autor_id == 2


def test_rejeita_cancelamento_com_menos_de_uma_hora_de_antecedencia() -> None:
    caso, _, _ = _caso(
        _agendamento(inicio=datetime.now(timezone.utc) + timedelta(minutes=30))
    )

    with pytest.raises(AgendamentoNaoPodeSerCanceladoError):
        caso.execute(
            CancelarAgendamentoInput(10, "Motivo"),
            _usuario(1, PerfilAcesso.CLIENTE),
        )


def test_rejeita_status_que_nao_pode_ser_cancelado() -> None:
    caso, _, _ = _caso(_agendamento(status=StatusAgendamento.CONCLUIDO))

    with pytest.raises(AgendamentoNaoPodeSerCanceladoError):
        caso.execute(
            CancelarAgendamentoInput(10, "Motivo"),
            _usuario(1, PerfilAcesso.CLIENTE),
        )


def test_rejeita_motivo_vazio_e_agendamento_inexistente() -> None:
    caso, _, _ = _caso()

    with pytest.raises(ValidationError):
        caso.execute(
            CancelarAgendamentoInput(10, "   "),
            _usuario(1, PerfilAcesso.CLIENTE),
        )

    caso = CancelarAgendamentoUseCase(
        InMemoryAgendamentoRepository(None),
        InMemoryCancelamentoRepository(),
    )
    with pytest.raises(AgendamentoNaoEncontradoError):
        caso.execute(
            CancelarAgendamentoInput(10, "Motivo"),
            _usuario(1, PerfilAcesso.CLIENTE),
        )


def test_endpoint_retorna_cancelamento_criado() -> None:
    caso, _, _ = _caso()
    cliente = _usuario(1, PerfilAcesso.CLIENTE)
    app.dependency_overrides[get_current_user] = lambda: cliente
    app.dependency_overrides[get_cancelar_agendamento_use_case] = lambda: caso

    try:
        response = TestClient(app).post(
            "/agendamentos/10/cancelar",
            json={"motivo": "Cliente solicitou o cancelamento"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    assert response.json()["agendamentoId"] == 10
    assert response.json()["autorId"] == 1
