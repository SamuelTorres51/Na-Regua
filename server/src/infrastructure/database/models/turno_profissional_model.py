from datetime import time

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, SmallInteger, Time
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.database.models.base import Base


class TurnoProfissionalModel(Base):
    """Jornada própria do profissional.

    Um profissional sem nenhuma linha aqui segue o funcionamento da barbearia.
    """

    __tablename__ = "turnos_profissionais"
    __table_args__ = (
        CheckConstraint(
            "dia_semana BETWEEN 0 AND 6",
            name="ck_turnos_profissionais_dia_semana",
        ),
        CheckConstraint(
            "inicio < fim",
            name="ck_turnos_profissionais_intervalo",
        ),
        Index("ix_turnos_profissionais_profissional_id", "profissional_id"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    profissional_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
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
