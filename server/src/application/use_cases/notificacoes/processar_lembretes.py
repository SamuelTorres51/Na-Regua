from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from domain.entities.notificacao import Notificacao
from domain.enums.status_agendamento import StatusAgendamento
from domain.enums.tipo_notificacao import TipoNotificacao
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.notificacao_repository import NotificacaoRepository
from domain.repositories.servico_repository import ServicoRepository

FORTALEZA_TZ = ZoneInfo("America/Fortaleza")


class ProcessarLembretesUseCase:
    def __init__(
        self,
        agendamento_repository: AgendamentoRepository,
        servico_repository: ServicoRepository,
        notificacao_repository: NotificacaoRepository,
    ) -> None:
        self.agendamento_repository = agendamento_repository
        self.servico_repository = servico_repository
        self.notificacao_repository = notificacao_repository

    def execute(self, janela_horas: int = 2) -> list[Notificacao]:
        agora = datetime.now(FORTALEZA_TZ)
        limite = agora + timedelta(hours=janela_horas)

        agendados = self.agendamento_repository.listar(
            inicio=agora,
            fim=limite,
            status=StatusAgendamento.AGENDADO,
        )
        confirmados = self.agendamento_repository.listar(
            inicio=agora,
            fim=limite,
            status=StatusAgendamento.CONFIRMADO,
        )

        agendamentos = agendados + confirmados
        notificacoes_geradas: list[Notificacao] = []

        for agendamento in agendamentos:
            if agendamento.id is None:
                continue

            if self.notificacao_repository.existe_notificacao_agendamento(
                agendamento.id,
                TipoNotificacao.LEMBRETE_AGENDAMENTO,
            ):
                continue

            servico = self.servico_repository.buscar_por_id(agendamento.servico_id)
            servico_nome = servico.nome if servico is not None else "Serviço"

            inicio_local = agendamento.inicio.astimezone(FORTALEZA_TZ)
            horario_fmt = inicio_local.strftime("%d/%m/%Y às %H:%M")

            notificacao = Notificacao(
                id=None,
                usuario_id=agendamento.cliente_id,
                tipo=TipoNotificacao.LEMBRETE_AGENDAMENTO,
                mensagem=(
                    f"Lembrete: você possui um agendamento para {servico_nome} "
                    f"em {horario_fmt}."
                ),
                enviada_em=agora,
                agendamento_id=agendamento.id,
            )
            criada = self.notificacao_repository.criar(notificacao)
            notificacoes_geradas.append(criada)

        return notificacoes_geradas

