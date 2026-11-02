from dataclasses import dataclass


@dataclass
class Servico:
    id: int | None
    nome: str
    descricao: str
    duracao_minutos: int
    preco: float
    ativo: bool = True
