from datetime import datetime, timezone

import pytest

from application.common.exceptions import (
    AgendamentoNaoPermitidoError,
    AgendamentoStatusInvalidoError,
)
from application.use_cases.agendamentos.atualizar_status_agendamento import (
    AtualizarStatusAgendamentoInput,
    AtualizarStatusAgendamentoUseCase,
)
from domain.entities.agendamento import Agendamento
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository


class InMemoryAgendamentoRepository(AgendamentoRepository):
    def __init__(self, agendamento: Agendamento) -> None:
        self.agendamento = agendamento

    def criar(self, agendamento: Agendamento) -> Agendamento:
        raise NotImplementedError

    def buscar_por_id(self, agendamento_id: int) -> Agendamento | None:
        if self.agendamento.id == agendamento_id:
            return self.agendamento
        return None

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
        raise NotImplementedError

    def existe_conflito_profissional(
        self,
        profissional_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        raise NotImplementedError

    def existe_conflito_cliente(
        self,
        cliente_id: int,
        inicio: datetime,
        fim: datetime,
    ) -> bool:
        raise NotImplementedError


def _usuario(id: int, perfil: PerfilAcesso) -> Usuario:
    return Usuario(
        id=id,
        nome=f"Usuário {id}",
        email=f"usuario{id}@example.com",
        telefone="86999999999",
        senha_hash="hash",
        perfil=perfil,
        ativo=True,
        criado_em=datetime.now(timezone.utc),
    )


def _caso(
    status: StatusAgendamento = StatusAgendamento.AGENDADO,
) -> tuple[AtualizarStatusAgendamentoUseCase, Agendamento]:
    agendamento = Agendamento(
        id=1,
        cliente_id=10,
        profissional_id=20,
        servico_id=30,
        inicio=datetime.now(timezone.utc),
        duracao_minutos=30,
        status=status,
    )
    return (
        AtualizarStatusAgendamentoUseCase(
            InMemoryAgendamentoRepository(agendamento)
        ),
        agendamento,
    )


@pytest.mark.parametrize(
    ("status_atual", "novo_status"),
    [
        (StatusAgendamento.AGENDADO, StatusAgendamento.CONFIRMADO),
        (StatusAgendamento.AGENDADO, StatusAgendamento.AUSENTE),
        (StatusAgendamento.CONFIRMADO, StatusAgendamento.EM_ATENDIMENTO),
        (StatusAgendamento.CONFIRMADO, StatusAgendamento.AUSENTE),
        (StatusAgendamento.EM_ATENDIMENTO, StatusAgendamento.CONCLUIDO),
    ],
)
def test_atualiza_transicoes_permitidas(
    status_atual: StatusAgendamento,
    novo_status: StatusAgendamento,
) -> None:
    caso, agendamento = _caso(status_atual)

    resultado = caso.execute(
        AtualizarStatusAgendamentoInput(1, novo_status),
        _usuario(20, PerfilAcesso.PROFISSIONAL),
    )

    assert resultado.status == novo_status
    assert agendamento.status == novo_status


def test_nao_permite_cancelamento_pelo_fluxo_de_status() -> None:
    caso, _ = _caso(StatusAgendamento.CONFIRMADO)

    with pytest.raises(AgendamentoStatusInvalidoError):
        caso.execute(
            AtualizarStatusAgendamentoInput(
                1,
                StatusAgendamento.CANCELADO,
            ),
            _usuario(20, PerfilAcesso.PROFISSIONAL),
        )


def test_nao_permite_reabrir_status_terminal() -> None:
    caso, _ = _caso(StatusAgendamento.CONCLUIDO)

    with pytest.raises(AgendamentoStatusInvalidoError):
        caso.execute(
            AtualizarStatusAgendamentoInput(
                1,
                StatusAgendamento.CONFIRMADO,
            ),
            _usuario(20, PerfilAcesso.PROFISSIONAL),
        )


def test_cliente_nao_pode_atualizar_status() -> None:
    caso, _ = _caso()

    with pytest.raises(AgendamentoNaoPermitidoError):
        caso.execute(
            AtualizarStatusAgendamentoInput(
                1,
                StatusAgendamento.CONFIRMADO,
            ),
            _usuario(10, PerfilAcesso.CLIENTE),
        )
