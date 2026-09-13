from dataclasses import dataclass
from datetime import datetime

from domain.enums.perfil_acesso import PerfilAcesso


@dataclass
class Usuario:
    id: int | None
    nome: str
    email: str
    telefone: str
    senha_hash: str
    perfil: PerfilAcesso
    ativo: bool
    criado_em: datetime