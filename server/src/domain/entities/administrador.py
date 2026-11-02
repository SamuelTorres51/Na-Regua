from dataclasses import dataclass

from domain.entities.usuario import Usuario
from domain.enums.perfil_acesso import PerfilAcesso


@dataclass
class Administrador(Usuario):
    def __post_init__(self) -> None:
        self.perfil = PerfilAcesso.ADMINISTRADOR
