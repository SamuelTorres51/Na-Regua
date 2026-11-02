from dataclasses import dataclass

from application.common.exceptions import (
    ProfissionalNaoEncontradoError,
    ValidationError,
)
from domain.entities.profissional import Profissional
from domain.repositories.profissional_repository import ProfissionalRepository


@dataclass(frozen=True)
class AtualizarProfissionalInput:
    id: int
    nome: str
    telefone: str


class AtualizarProfissionalUseCase:
    def __init__(self, profissional_repository: ProfissionalRepository) -> None:
        self.profissional_repository = profissional_repository

    def validate(self, dados: AtualizarProfissionalInput) -> None:
        if not dados.id or dados.id <= 0:
            raise ValidationError("ID do profissional inválido.")

        nome = dados.nome.strip() if dados.nome else ""
        if not nome:
            raise ValidationError("O nome não pode estar vazio.")
        if len(nome) < 3 or len(nome) > 150:
            raise ValidationError("O nome deve ter entre 3 e 150 caracteres.")

        telefone = dados.telefone.strip() if dados.telefone else ""
        if not telefone:
            raise ValidationError("O telefone não pode estar vazio.")
        if len(telefone) < 10 or len(telefone) > 20:
            raise ValidationError("O telefone deve ter entre 10 e 20 caracteres.")

    def execute(self, dados: AtualizarProfissionalInput) -> Profissional:
        self.validate(dados)

        profissional = self.profissional_repository.buscar_por_id(dados.id)
        if profissional is None:
            raise ProfissionalNaoEncontradoError(
                f"Profissional com ID {dados.id} não encontrado."
            )

        profissional.nome = dados.nome.strip()
        profissional.telefone = dados.telefone.strip()

        return self.profissional_repository.atualizar(profissional)
