from enum import Enum


class StatusAgendamento(str, Enum):
    AGENDADO = "agendado"
    CONFIRMADO = "confirmado"
    EM_ATENDIMENTO = "em_atendimento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"
    AUSENTE = "ausente"