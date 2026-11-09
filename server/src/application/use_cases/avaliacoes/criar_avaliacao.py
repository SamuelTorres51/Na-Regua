from dataclasses import dataclass

from application.common.exceptions import (
    AgendamentoNaoEncontradoError,
    AvaliacaoAgendamentoNaoConcluidoError,
    AvaliacaoJaRegistradaError,
    AvaliacaoNaoPermitidaError,
    ValidationError,
)
from domain.entities.avaliacao import Avaliacao
from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso
from domain.enums.status_agendamento import StatusAgendamento
from domain.repositories.agendamento_repository import AgendamentoRepository
from domain.repositories.avaliacao_repository import AvaliacaoRepository


@dataclass(frozen=True)
class CriarAvaliacaoInput:
    agendamento_id: int
    nota: int
    comentario: str = ""


class CriarAvaliacaoUseCase:
    def __init__(
        self,
        agendamento_repository: AgendamentoRepository,
        avaliacao_repository: AvaliacaoRepository,
    ) -> None:
        self.agendamento_repository = agendamento_repository
        self.avaliacao_repository = avaliacao_repository

    def execute(
        self,
        dados: CriarAvaliacaoInput,
        usuario_atual: Usuario,
    ) -> Avaliacao:
        self._validar_nota(dados.nota)
        comentario = self._normalizar_comentario(dados.comentario)

        agendamento = self.agendamento_repository.buscar_por_id(
            dados.agendamento_id
        )
        if agendamento is None:
            raise AgendamentoNaoEncontradoError(
                f"Agendamento com ID {dados.agendamento_id} nÃ£o encontrado."
            )

        if (
            usuario_atual.perfil != PerfilAcesso.CLIENTE
            or usuario_atual.id != agendamento.cliente_id
        ):
            raise AvaliacaoNaoPermitidaError(
                "Somente o cliente do agendamento pode avaliÃ¡-lo."
            )

        if agendamento.status != StatusAgendamento.CONCLUIDO:
            raise AvaliacaoAgendamentoNaoConcluidoError(
                "A avaliaÃ§Ã£o sÃ³ pode ser registrada apÃ³s a conclusÃ£o do atendimento."
            )

        if (
            self.avaliacao_repository.buscar_por_agendamento_id(
                dados.agendamento_id
            )
            is not None
        ):
            raise AvaliacaoJaRegistradaError(
                "Este agendamento jÃ¡ possui uma avaliaÃ§Ã£o."
            )

        return self.avaliacao_repository.criar(
            Avaliacao(
                id=None,
                agendamento_id=dados.agendamento_id,
                cliente_id=agendamento.cliente_id,
                profissional_id=agendamento.profissional_id,
                nota=dados.nota,
                comentario=comentario,
            )
        )

    @staticmethod
    def _validar_nota(nota: int) -> None:
        if nota < 1 or nota > 5:
            raise ValidationError("A nota deve estar entre 1 e 5.")

    @staticmethod
    def _normalizar_comentario(comentario: str) -> str:
        comentario_normalizado = comentario.strip()
        if len(comentario_normalizado) > 1000:
            raise ValidationError(
                "O comentÃ¡rio deve ter no mÃ¡ximo 1000 caracteres."
            )
        return comentario_normalizado
