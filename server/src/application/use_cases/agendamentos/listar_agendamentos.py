from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

from application.common.exceptions import AgendamentoNaoPermitidoError, ValidationError
from domain.entities.agendamento import Agendamento
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository

FORTALEZA_TZ = ZoneInfo("America/Fortaleza")


@dataclass(frozen=True)
class ListarAgendamentosInput:
    inicio: datetime | None = None
    fim: datetime | None = None
    profissional_id: int | None = None
    cliente_id: int | None = None
    status: StatusAgendamento | None = None


class ListarAgendamentosUseCase:
    def __init__(self, repository: AgendamentoRepository) -> None:
        self.repository = repository

    def execute(
        self,
        dados: ListarAgendamentosInput,
        usuario_atual: Usuario,
    ) -> list[Agendamento]:
        inicio = _normalizar_data(dados.inicio)
        fim = _normalizar_data(dados.fim)

        if inicio is not None and fim is not None and fim < inicio:
            raise ValidationError(
                "A data final não pode ser anterior à data inicial."
            )

        profissional_id = dados.profissional_id
        cliente_id = dados.cliente_id

        if usuario_atual.perfil == PerfilAcesso.PROFISSIONAL:
            if (
                profissional_id is not None
                and profissional_id != usuario_atual.id
            ):
                raise AgendamentoNaoPermitidoError(
                    "O profissional só pode consultar os próprios agendamentos."
                )
            profissional_id = usuario_atual.id
        elif usuario_atual.perfil == PerfilAcesso.CLIENTE:
            if cliente_id is not None and cliente_id != usuario_atual.id:
                raise AgendamentoNaoPermitidoError(
                    "O cliente só pode consultar os próprios agendamentos."
                )
            cliente_id = usuario_atual.id

        return self.repository.listar(
            inicio=inicio,
            fim=fim,
            profissional_id=profissional_id,
            cliente_id=cliente_id,
            status=dados.status,
        )


def _normalizar_data(valor: datetime | None) -> datetime | None:
    if valor is None:
        return None
    if valor.tzinfo is None or valor.utcoffset() is None:
        raise ValidationError("As datas devem informar o timezone.")
    return valor.astimezone(FORTALEZA_TZ)
