from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from domain.enums.status_disponibilidade import StatusDisponibilidade


class DiaDisponibilidadeResponse(BaseModel):
    data: date
    status: StatusDisponibilidade
    horarios: list[datetime]

    model_config = ConfigDict(from_attributes=True)
