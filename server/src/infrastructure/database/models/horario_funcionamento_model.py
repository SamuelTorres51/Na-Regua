from datetime import time

from sqlalchemy import CheckConstraint, Integer, SmallInteger, Time
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.database.models.base import Base


class HorarioFuncionamentoModel(Base):
    __tablename__ = "horarios_funcionamento"
    __table_args__ = (
        CheckConstraint(
            "dia_semana BETWEEN 0 AND 6",
            name="ck_horarios_funcionamento_dia_semana",
        ),
        CheckConstraint(
            "inicio < fim",
            name="ck_horarios_funcionamento_intervalo",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # 0 = segunda ... 6 = domingo, o mesmo padrão de date.weekday().
    dia_semana: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
    )

    inicio: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    fim: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )
