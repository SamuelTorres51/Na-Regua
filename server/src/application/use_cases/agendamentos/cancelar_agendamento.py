from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from application.common.exceptions import (
    AgendamentoNaoEncontradoError,
    AgendamentoNaoPermitidoError,
    AgendamentoNaoPodeSerCanceladoError,
    ValidationError,
)
from domain.entities.cancelamento import Cancelamento
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.cancelamento_repository import CancelamentoRepository

FORTALEZA_TZ = ZoneInfo("America/Fortaleza")
ANTECEDENCIA_MINIMA_CANCELAMENTO = timedelta(minutes=60)
_STATUS_CANCELAVEIS = (
    StatusAgendamento.AGENDADO,
    StatusAgendamento.CONFIRMADO,
)


@dataclass(frozen=True)
class CancelarAgendamentoInput:
    agendamento_id: int
    motivo: str


class CancelarAgendamentoUseCase:
    def __init__(
        self,
        agendamento_repository: AgendamentoRepository,
        cancelamento_repository: CancelamentoRepository,
    ) -> None:
        self.agendamento_repository = agendamento_repository
        self.cancelamento_repository = cancelamento_repository

    def execute(
        self,
        dados: CancelarAgendamentoInput,
        usuario_atual: Usuario,
    ) -> Cancelamento:
        motivo = dados.motivo.strip()
        if not motivo:
            raise ValidationError("O motivo do cancelamento é obrigatório.")

        agendamento = self.agendamento_repository.buscar_por_id(
            dados.agendamento_id
        )
        if agendamento is None:
            raise AgendamentoNaoEncontradoError(
                f"Agendamento com ID {dados.agendamento_id} não encontrado."
            )

        self._validar_permissao(agendamento, usuario_atual)

        if agendamento.status not in _STATUS_CANCELAVEIS:
            raise AgendamentoNaoPodeSerCanceladoError(
                "O agendamento não pode ser cancelado no status atual."
            )

        inicio = _normalizar_datetime(agendamento.inicio)
        if inicio < datetime.now(FORTALEZA_TZ) + ANTECEDENCIA_MINIMA_CANCELAMENTO:
            raise AgendamentoNaoPodeSerCanceladoError(
                "O cancelamento deve ser realizado com pelo menos 60 minutos de antecedência."
            )

        cancelado_em = datetime.now(FORTALEZA_TZ)
        cancelamento = Cancelamento(
            id=None,
            agendamento_id=agendamento.id,
            autor_id=usuario_atual.id,
            motivo=motivo,
            cancelado_em=cancelado_em,
        )
        self.agendamento_repository.atualizar_status(
            agendamento.id,
            StatusAgendamento.CANCELADO,
        )
        return self.cancelamento_repository.criar(cancelamento)

    @staticmethod
    def _validar_permissao(agendamento, usuario_atual: Usuario) -> None:
        if usuario_atual.perfil == PerfilAcesso.ADMINISTRADOR:
            return
        if (
            usuario_atual.perfil == PerfilAcesso.CLIENTE
            and usuario_atual.id == agendamento.cliente_id
        ):
            return
        if (
            usuario_atual.perfil == PerfilAcesso.PROFISSIONAL
            and usuario_atual.id == agendamento.profissional_id
        ):
            return
        raise AgendamentoNaoPermitidoError(
            "O usuário não pode cancelar este agendamento."
        )


def _normalizar_datetime(valor: datetime) -> datetime:
    if valor.tzinfo is None or valor.utcoffset() is None:
        raise ValidationError(
            "A data e hora do agendamento devem informar o timezone."
        )
    return valor.astimezone(FORTALEZA_TZ)
