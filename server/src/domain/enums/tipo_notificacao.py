from enum import Enum


class TipoNotificacao(str, Enum):
    CONFIRMACAO_AGENDAMENTO = "confirmacao_agendamento"       # RF62
    NOVO_AGENDAMENTO = "novo_agendamento"                     # RF63
    CANCELAMENTO_AGENDAMENTO = "cancelamento_agendamento"     # RF64
    LEMBRETE_AGENDAMENTO = "lembrete_agendamento"             # RF65

