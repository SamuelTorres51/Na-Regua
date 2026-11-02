from dataclasses import dataclass

from application.common.exceptions import (
    ServicoNomeDuplicadoError,
    ValidationError,
)
from domain.entities.servico import Servico
from domain.repositories.servico_repository import ServicoRepository


@dataclass(frozen=True)
class CriarServicoInput:
    nome: str
    descricao: str
    duracao_minutos: int
    preco: float
    ativo: bool = True


class CriarServicoUseCase:
    def __init__(self, servico_repository: ServicoRepository) -> None:
        self.servico_repository = servico_repository

    def validate(self, dados: CriarServicoInput) -> None:
        nome = dados.nome.strip() if dados.nome else ""
        if not nome:
            raise ValidationError("O nome do serviço não pode estar vazio.")
        if len(nome) < 2 or len(nome) > 150:
            raise ValidationError("O nome do serviço deve ter entre 2 e 150 caracteres.")

        if dados.duracao_minutos <= 0:
            raise ValidationError("A duração do serviço deve ser maior que 0 minutos.")

        if dados.preco < 0:
            raise ValidationError("O preço do serviço não pode ser negativo.")

    def execute(self, dados: CriarServicoInput) -> Servico:
        self.validate(dados)

        nome = dados.nome.strip()
        if self.servico_repository.buscar_por_nome(nome) is not None:
            raise ServicoNomeDuplicadoError(f"Já existe um serviço cadastrado com o nome '{nome}'.")

        servico = Servico(
            id=None,
            nome=nome,
            descricao=dados.descricao.strip() if dados.descricao else "",
            duracao_minutos=dados.duracao_minutos,
            preco=float(dados.preco),
            ativo=dados.ativo,
        )

        return self.servico_repository.criar(servico)
