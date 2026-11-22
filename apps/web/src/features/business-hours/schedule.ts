export const DIAS_SEMANA = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const NOMES_DIAS: Record<DiaSemana, string> = {
  domingo: "Domingo",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sabado: "Sábado",
  segunda: "Segunda-feira",
  sexta: "Sexta-feira",
  terca: "Terça-feira",
};

export interface Turno {
  diaSemana: DiaSemana;
  fim: string;
  inicio: string;
}

export type CampoTurno = "inicio" | "fim";

const TIME_PATTERN = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;

export function ordenarTurnos(turnos: readonly Turno[]) {
  return [...turnos].sort(
    (first, second) =>
      DIAS_SEMANA.indexOf(first.diaSemana) -
        DIAS_SEMANA.indexOf(second.diaSemana) ||
      first.inicio.localeCompare(second.inicio)
  );
}

export function turnosIguais(
  first: readonly Turno[] | null,
  second: readonly Turno[] | null
) {
  if (first === null || second === null) {
    return first === second;
  }

  return (
    first.length === second.length &&
    first.every(({ diaSemana, fim, inicio }, index) => {
      const other = second.at(index);
      return (
        other?.diaSemana === diaSemana &&
        other.fim === fim &&
        other.inicio === inicio
      );
    })
  );
}

export function validarTurnos(turnos: readonly Turno[]) {
  if (turnos.length === 0) {
    return "Informe pelo menos um turno na semana.";
  }

  let anterior: Turno | undefined;

  for (const turno of ordenarTurnos(turnos)) {
    const { diaSemana, fim, inicio } = turno;
    const dia = NOMES_DIAS[diaSemana].toLocaleLowerCase("pt-BR");

    if (!(TIME_PATTERN.test(inicio) && TIME_PATTERN.test(fim))) {
      return `Preencha o início e o fim de cada turno de ${dia}.`;
    }
    if (inicio >= fim) {
      return `O fim do turno de ${dia} (${inicio}–${fim}) deve ser depois do início.`;
    }
    if (anterior?.diaSemana === diaSemana && inicio < anterior.fim) {
      return `Os turnos de ${dia} (${anterior.inicio}–${anterior.fim} e ${inicio}–${fim}) se sobrepõem.`;
    }

    anterior = turno;
  }

  return null;
}
