from dataclasses import dataclass

from application.common.exceptions import (
    ServicoNaoEncontradoError,
    ServicoNomeDuplicadoError,
    ValidationError,
)
from domain.entities.servico import Servico
from domain.repositories.servico_repository import ServicoRepository


@dataclass(frozen=True)
class AtualizarServicoInput:
    id: int
    nome: str
    descricao: str
    duracao_minutos: int
    preco: float
    ativo: bool


class AtualizarServicoUseCase:
    def __init__(self, servico_repository: ServicoRepository) -> None:
        self.servico_repository = servico_repository

    def validate(self, dados: AtualizarServicoInput) -> None:
        if not dados.id or dados.id <= 0:
            raise ValidationError("ID do serviço inválido.")

        nome = dados.nome.strip() if dados.nome else ""
        if not nome:
            raise ValidationError("O nome do serviço não pode estar vazio.")
        if len(nome) < 2 or len(nome) > 150:
            raise ValidationError("O nome do serviço deve ter entre 2 e 150 caracteres.")

        if dados.duracao_minutos <= 0:
            raise ValidationError("A duração do serviço deve ser maior que 0 minutos.")

        if dados.preco < 0:
            raise ValidationError("O preço do serviço não pode ser negativo.")

    def execute(self, dados: AtualizarServicoInput) -> Servico:
        self.validate(dados)

        servico = self.servico_repository.buscar_por_id(dados.id)
        if servico is None:
            raise ServicoNaoEncontradoError(f"Serviço com ID {dados.id} não encontrado.")

        nome = dados.nome.strip()
        existente = self.servico_repository.buscar_por_nome(nome)
        if existente is not None and existente.id != dados.id:
            raise ServicoNomeDuplicadoError(f"Já existe outro serviço cadastrado com o nome '{nome}'.")

        servico.nome = nome
        servico.descricao = dados.descricao.strip() if dados.descricao else ""
        servico.duracao_minutos = dados.duracao_minutos
        servico.preco = float(dados.preco)
        servico.ativo = dados.ativo

        return self.servico_repository.atualizar(servico)
