from dataclasses import dataclass


@dataclass(frozen=True)
class ProfissionalServico:
    profissional_id: int
    servico_id: int
