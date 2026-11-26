from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

from application.common.exceptions import (
    AgendamentoNaoEncontradoError,
    AgendamentoNaoPermitidoError,
    AgendamentoStatusInvalidoError,
)
from domain.entities.agendamento import Agendamento
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository

FORTALEZA_TZ = ZoneInfo("America/Fortaleza")
_STATUS_QUE_EXIGEM_HORARIO = frozenset(
    {
        StatusAgendamento.EM_ATENDIMENTO,
        StatusAgendamento.CONCLUIDO,
    }
)

_TRANSICOES_PERMITIDAS: dict[
    StatusAgendamento, frozenset[StatusAgendamento]
] = {
    StatusAgendamento.AGENDADO: frozenset(
        {
            StatusAgendamento.CONFIRMADO,
            StatusAgendamento.AUSENTE,
        }
    ),
    StatusAgendamento.CONFIRMADO: frozenset(
        {
            StatusAgendamento.EM_ATENDIMENTO,
            StatusAgendamento.AUSENTE,
        }
    ),
    StatusAgendamento.EM_ATENDIMENTO: frozenset(
        {StatusAgendamento.CONCLUIDO}
    ),
    StatusAgendamento.CONCLUIDO: frozenset(),
    StatusAgendamento.AUSENTE: frozenset(),
    StatusAgendamento.CANCELADO: frozenset(),
}


@dataclass(frozen=True)
class AtualizarStatusAgendamentoInput:
    agendamento_id: int
    status: StatusAgendamento


class AtualizarStatusAgendamentoUseCase:
    def __init__(self, repository: AgendamentoRepository) -> None:
        self.repository = repository

    def execute(
        self,
        dados: AtualizarStatusAgendamentoInput,
        usuario_atual: Usuario,
    ) -> Agendamento:
        agendamento = self.repository.buscar_por_id(dados.agendamento_id)
        if agendamento is None:
            raise AgendamentoNaoEncontradoError(
                f"Agendamento com ID {dados.agendamento_id} não encontrado."
            )

        self._validar_permissao(agendamento, usuario_atual)

        status_atual = agendamento.status
        if dados.status not in _TRANSICOES_PERMITIDAS[status_atual]:
            raise AgendamentoStatusInvalidoError(
                f"Não é possível alterar o status de "
                f"{status_atual.value} para {dados.status.value}."
            )

        if dados.status in _STATUS_QUE_EXIGEM_HORARIO:
            inicio = agendamento.inicio
            if inicio.tzinfo is None or inicio.utcoffset() is None:
                raise AgendamentoStatusInvalidoError(
                    "A data e hora do agendamento devem informar o timezone."
                )
            if datetime.now(FORTALEZA_TZ) < inicio.astimezone(FORTALEZA_TZ):
                raise AgendamentoStatusInvalidoError(
                    f"O status {dados.status.value} só pode ser atribuído "
                    "a partir do horário do agendamento."
                )

        agendamento_atualizado = self.repository.atualizar_status(
            dados.agendamento_id,
            dados.status,
        )
        if agendamento_atualizado is None:
            raise AgendamentoNaoEncontradoError(
                f"Agendamento com ID {dados.agendamento_id} não encontrado."
            )
        return agendamento_atualizado

    @staticmethod
    def _validar_permissao(
        agendamento: Agendamento,
        usuario_atual: Usuario,
    ) -> None:
        if usuario_atual.perfil == PerfilAcesso.ADMINISTRADOR:
            return
        if (
            usuario_atual.perfil == PerfilAcesso.PROFISSIONAL
            and usuario_atual.id == agendamento.profissional_id
        ):
            return
        raise AgendamentoNaoPermitidoError(
            "O usuário não pode atualizar o status deste agendamento."
        )
