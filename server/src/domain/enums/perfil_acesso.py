from enum import Enum

class PerfilAcesso(str, Enum):
    ADMINISTRADOR = "administrador"
    CLIENTE = "cliente"
    PROFISSIONAL = "profissional"