from dataclasses import dataclass
from datetime import date

from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso


@dataclass
class Cliente(Usuario):
    data_nascimento: date | None = None

    def __post_init__(self) -> None:
        self.perfil = PerfilAcesso.CLIENTE
