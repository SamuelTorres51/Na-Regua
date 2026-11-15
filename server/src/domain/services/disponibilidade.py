"""Cálculo dos horários em que um profissional pode receber um agendamento.

Nenhum horário é armazenado: tudo é derivado do funcionamento da barbearia,
da jornada do profissional e dos agendamentos ativos. Um horário de início só
é oferecido quando o serviço inteiro cabe numa janela livre, então o que está
disponível depende da duração do serviço escolhido.
"""

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, tzinfo

from domain.entities.periodo import Periodo
from domain.entities.turno import Turno
from domain.enums.dia_semana import DiaSemana
from domain.enums.status_disponibilidade import StatusDisponibilidade


@dataclass(frozen=True)
class DiaDisponibilidade:
    data: date
    status: StatusDisponibilidade
    horarios: list[datetime] = field(default_factory=list)


def periodos_de_trabalho(
    funcionamento: list[Turno],
    jornada: list[Turno] | None,
    dia: date,
    fuso: tzinfo,
) -> list[Periodo]:
    """Períodos em que o profissional atende no dia informado.

    Sem jornada própria (None), o profissional segue o horário integral da
    barbearia. Com jornada própria, vale apenas a parte que estiver dentro do
    funcionamento da barbearia (RN02).
    """
    abertura = _periodos_do_dia(funcionamento, dia, fuso)
    if jornada is None:
        return abertura
    return _unir(intersectar(abertura, _periodos_do_dia(jornada, dia, fuso)))


def cabe_no_expediente(periodo: Periodo, expediente: list[Periodo]) -> bool:
    return any(
        trabalho.inicio <= periodo.inicio and periodo.fim <= trabalho.fim
        for trabalho in expediente
    )


def calcular_dia(
    dia: date,
    *,
    funcionamento: list[Turno],
    jornada: list[Turno] | None,
    ocupados: list[Periodo],
    duracao: timedelta,
    passo: timedelta,
    inicio_minimo: datetime,
    inicio_maximo: datetime,
    fuso: tzinfo,
) -> DiaDisponibilidade:
    if not _periodos_do_dia(funcionamento, dia, fuso):
        return DiaDisponibilidade(dia, StatusDisponibilidade.FECHADO)

    expediente = periodos_de_trabalho(funcionamento, jornada, dia, fuso)
    if not expediente:
        return DiaDisponibilidade(dia, StatusDisponibilidade.FOLGA)

    horarios = horarios_disponiveis(
        expediente,
        [_no_fuso(ocupado, fuso) for ocupado in ocupados],
        duracao=duracao,
        passo=passo,
        inicio_minimo=inicio_minimo.astimezone(fuso),
        inicio_maximo=inicio_maximo.astimezone(fuso),
    )
    status = (
        StatusDisponibilidade.DISPONIVEL
        if horarios
        else StatusDisponibilidade.LOTADO
    )
    return DiaDisponibilidade(dia, status, horarios)


def horarios_disponiveis(
    expediente: list[Periodo],
    ocupados: list[Periodo],
    *,
    duracao: timedelta,
    passo: timedelta,
    inicio_minimo: datetime,
    inicio_maximo: datetime,
) -> list[datetime]:
    """Inícios possíveis, numa grade de `passo` contada a partir da meia-noite.

    Cada janela livre também oferece o próprio início (encaixe): se um
    atendimento termina às 10:15, o horário das 10:15 aparece antes do
    próximo ponto da grade, sem deixar minutos ociosos.
    """
    horarios: list[datetime] = []
    for janela in subtrair(expediente, ocupados):
        if janela.inicio >= inicio_minimo:
            candidato = janela.inicio
        else:
            candidato = _teto_da_grade(inicio_minimo, passo)

        while candidato + duracao <= janela.fim and candidato <= inicio_maximo:
            horarios.append(candidato)
            candidato = _proximo_da_grade(candidato, passo)
    return horarios


def intersectar(
    primeiros: list[Periodo],
    segundos: list[Periodo],
) -> list[Periodo]:
    intersecoes = []
    for primeiro in primeiros:
        for segundo in segundos:
            inicio = max(primeiro.inicio, segundo.inicio)
            fim = min(primeiro.fim, segundo.fim)
            if inicio < fim:
                intersecoes.append(Periodo(inicio, fim))
    return sorted(intersecoes, key=lambda periodo: periodo.inicio)


def subtrair(livres: list[Periodo], ocupados: list[Periodo]) -> list[Periodo]:
    for ocupado in ocupados:
        restantes = []
        for livre in livres:
            if ocupado.fim <= livre.inicio or ocupado.inicio >= livre.fim:
                restantes.append(livre)
                continue
            if livre.inicio < ocupado.inicio:
                restantes.append(Periodo(livre.inicio, ocupado.inicio))
            if ocupado.fim < livre.fim:
                restantes.append(Periodo(ocupado.fim, livre.fim))
        livres = restantes
    return livres


def _periodos_do_dia(
    turnos: list[Turno],
    dia: date,
    fuso: tzinfo,
) -> list[Periodo]:
    dia_semana = DiaSemana.da_data(dia)
    periodos = sorted(
        (
            Periodo(
                datetime.combine(dia, turno.inicio, fuso),
                datetime.combine(dia, turno.fim, fuso),
            )
            for turno in turnos
            if turno.dia_semana == dia_semana
        ),
        key=lambda periodo: periodo.inicio,
    )
    return _unir(periodos)


def _unir(periodos: list[Periodo]) -> list[Periodo]:
    """Junta períodos encostados, como 08:00–12:00 e 12:00–14:00."""
    unidos: list[Periodo] = []
    for periodo in periodos:
        if unidos and periodo.inicio <= unidos[-1].fim:
            ultimo = unidos[-1]
            unidos[-1] = Periodo(ultimo.inicio, max(ultimo.fim, periodo.fim))
        else:
            unidos.append(periodo)
    return unidos


def _no_fuso(periodo: Periodo, fuso: tzinfo) -> Periodo:
    return Periodo(periodo.inicio.astimezone(fuso), periodo.fim.astimezone(fuso))


def _meia_noite(momento: datetime) -> datetime:
    return momento.replace(hour=0, minute=0, second=0, microsecond=0)


def _proximo_da_grade(momento: datetime, passo: timedelta) -> datetime:
    meia_noite = _meia_noite(momento)
    return meia_noite + ((momento - meia_noite) // passo + 1) * passo


def _teto_da_grade(momento: datetime, passo: timedelta) -> datetime:
    if (momento - _meia_noite(momento)) % passo == timedelta(0):
        return momento
    return _proximo_da_grade(momento, passo)
