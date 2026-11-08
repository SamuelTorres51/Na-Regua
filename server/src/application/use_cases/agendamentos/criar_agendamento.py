from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from application.common.exceptions import (
    AgendamentoConflitanteError,
    AgendamentoNaoPermitidoError,
    ClienteNaoEncontradoError,
    ProfissionalNaoEncontradoError,
    ProfissionalServicoNaoEncontradoError,
    ServicoNaoEncontradoError,
    ValidationError,
)
from domain.entities.agendamento import Agendamento
from domain.entities.notificacao import Notificacao
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.enums.tipo_notificacao import TipoNotificacao
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.notificacao_repository import NotificacaoRepository
from domain.repositories.servico_repository import ServicoRepository
from domain.repositories.profissional_servico_repository import (
    ProfissionalServicoRepository,
)
from domain.repositories.usuario_repository import UsuarioRepository

FORTALEZA_TZ = ZoneInfo("America/Fortaleza")
ANTECEDENCIA_MINIMA = timedelta(minutes=30)
JANELA_MAXIMA = timedelta(days=15)


@dataclass(frozen=True)
class CriarAgendamentoInput:
    cliente_id: int
    profissional_id: int
    servico_id: int
    inicio: datetime


class CriarAgendamentoUseCase:
    def __init__(
        self,
        agendamento_repository: AgendamentoRepository,
        usuario_repository: UsuarioRepository,
        servico_repository: ServicoRepository,
        profissional_servico_repository: ProfissionalServicoRepository,
        notificacao_repository: NotificacaoRepository | None = None,
    ) -> None:
        self.agendamento_repository = agendamento_repository
        self.usuario_repository = usuario_repository
        self.servico_repository = servico_repository
        self.profissional_servico_repository = profissional_servico_repository
        self.notificacao_repository = notificacao_repository

    def execute(
        self,
        dados: CriarAgendamentoInput,
        usuario_atual: Usuario,
    ) -> Agendamento:
        agora = datetime.now(FORTALEZA_TZ)
        inicio = _normalizar_datetime(dados.inicio)
        self._validar_data(inicio, agora)
        self._validar_permissao_cliente(usuario_atual, dados.cliente_id)

        cliente = self.usuario_repository.buscar_por_id(dados.cliente_id)
        self._validar_cliente(cliente)

        profissional = self.usuario_repository.buscar_por_id(
            dados.profissional_id
        )
        self._validar_profissional(profissional)

        servico = self.servico_repository.buscar_por_id(dados.servico_id)
        if servico is None or not servico.ativo:
            raise ServicoNaoEncontradoError(
                f"Serviço com ID {dados.servico_id} não encontrado ou inativo."
            )

        if not self.profissional_servico_repository.existe(
            dados.profissional_id,
            dados.servico_id,
        ):
            raise ProfissionalServicoNaoEncontradoError(
                "O profissional selecionado não oferece o serviço informado."
            )

        fim = inicio + timedelta(minutes=servico.duracao_minutos)
        if self.agendamento_repository.existe_conflito_profissional(
            dados.profissional_id,
            inicio,
            fim,
        ):
            raise AgendamentoConflitanteError(
                "O profissional já possui um agendamento nesse horário."
            )

        if self.agendamento_repository.existe_conflito_cliente(
            dados.cliente_id,
            inicio,
            fim,
        ):
            raise AgendamentoConflitanteError(
                "O cliente já possui um agendamento nesse horário."
            )

        criado = self.agendamento_repository.criar(
            Agendamento(
                id=None,
                cliente_id=dados.cliente_id,
                profissional_id=dados.profissional_id,
                servico_id=dados.servico_id,
                inicio=inicio,
                duracao_minutos=servico.duracao_minutos,
                status=StatusAgendamento.AGENDADO,
            )
        )

        if self.notificacao_repository is not None:
            inicio_fmt = inicio.strftime("%d/%m/%Y às %H:%M")
            # RF62: Notificação ao cliente confirmando agendamento realizado
            self.notificacao_repository.criar(
                Notificacao(
                    id=None,
                    usuario_id=dados.cliente_id,
                    tipo=TipoNotificacao.CONFIRMACAO_AGENDAMENTO,
                    mensagem=(
                        f"Seu agendamento para {servico.nome} em {inicio_fmt} "
                        "foi realizado com sucesso."
                    ),
                    enviada_em=agora,
                    agendamento_id=criado.id,
                )
            )
            # RF63: Notificação ao profissional sobre novo agendamento
            cliente_nome = cliente.nome if cliente is not None else "Cliente"
            self.notificacao_repository.criar(
                Notificacao(
                    id=None,
                    usuario_id=dados.profissional_id,
                    tipo=TipoNotificacao.NOVO_AGENDAMENTO,
                    mensagem=(
                        f"Novo agendamento recebido: {servico.nome} com {cliente_nome} "
                        f"em {inicio_fmt}."
                    ),
                    enviada_em=agora,
                    agendamento_id=criado.id,
                )
            )

        return criado

    @staticmethod
    def _validar_data(inicio: datetime, agora: datetime) -> None:
        if inicio < agora + ANTECEDENCIA_MINIMA:
            raise ValidationError(
                "O agendamento deve ser criado com antecedência mínima de 30 minutos."
            )
        if inicio > agora + JANELA_MAXIMA:
            raise ValidationError(
                "O agendamento não pode ser criado para mais de 15 dias à frente."
            )

    @staticmethod
    def _validar_cliente(cliente: Usuario | None) -> None:
        if (
            cliente is None
            or cliente.perfil != PerfilAcesso.CLIENTE
            or not cliente.ativo
        ):
            raise ClienteNaoEncontradoError(
                "Cliente não encontrado ou inativo."
            )

    @staticmethod
    def _validar_profissional(profissional: Usuario | None) -> None:
        if (
            profissional is None
            or profissional.perfil != PerfilAcesso.PROFISSIONAL
            or not profissional.ativo
        ):
            raise ProfissionalNaoEncontradoError(
                "Profissional não encontrado ou inativo."
            )

    @staticmethod
    def _validar_permissao_cliente(
        usuario_atual: Usuario,
        cliente_id: int,
    ) -> None:
        if (
            usuario_atual.perfil == PerfilAcesso.CLIENTE
            and usuario_atual.id != cliente_id
        ):
            raise AgendamentoNaoPermitidoError(
                "O cliente só pode criar agendamentos para si mesmo."
            )


def _normalizar_datetime(valor: datetime) -> datetime:
    if valor.tzinfo is None or valor.utcoffset() is None:
        raise ValidationError(
            "A data e hora do agendamento devem informar o timezone."
        )
    return valor.astimezone(FORTALEZA_TZ)
