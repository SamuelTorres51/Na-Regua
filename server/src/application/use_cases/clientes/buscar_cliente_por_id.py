from application.common.exceptions import ClienteNaoEncontradoError
from domain.entities.cliente import Cliente
from domain.repositories.cliente_repository import ClienteRepository


class BuscarClientePorIdUseCase:
    def __init__(self, cliente_repository: ClienteRepository) -> None:
        self.cliente_repository = cliente_repository

    def execute(self, cliente_id: int) -> Cliente:
        cliente = self.cliente_repository.buscar_por_id(cliente_id)
        if cliente is None:
            raise ClienteNaoEncontradoError(
                f"Cliente com ID {cliente_id} não encontrado."
            )
        return cliente
