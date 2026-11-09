from domain.entities.cliente import Cliente
from domain.repositories.cliente_repository import ClienteRepository


class ListarClientesUseCase:
    def __init__(self, cliente_repository: ClienteRepository) -> None:
        self.cliente_repository = cliente_repository

    def execute(self, apenas_ativos: bool = False) -> list[Cliente]:
        return self.cliente_repository.listar(apenas_ativos=apenas_ativos)
