from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NotificacaoResponse(BaseModel):
    id: int
    usuario_id: int
    tipo: str
    mensagem: str
    enviada_em: datetime
    lida: bool
    agendamento_id: int | None = None

    model_config = ConfigDict(from_attributes=True)


class ContadorNotificacoesResponse(BaseModel):
    total_nao_lidas: int


class ProcessarLembretesRequest(BaseModel):
    janela_horas: int = Field(default=2, ge=1, le=24)


class ProcessarLembretesResponse(BaseModel):
    total_processados: int
    notificacoes: list[NotificacaoResponse]

