import { useCallback, useMemo, useRef, useState } from "react";

import {
  type CampoTurno,
  type DiaSemana,
  ordenarTurnos,
  type Turno,
} from "./schedule";

export interface EditableTurno extends Turno {
  id: number;
}

function toDraft(turnos: readonly Turno[]): EditableTurno[] {
  return ordenarTurnos(turnos).map((turno, id) => ({ ...turno, id }));
}

export function useTurnosEditor(
  initialTurnos: readonly Turno[],
  onEdit: () => void
) {
  const [draft, setDraft] = useState(() => toDraft(initialTurnos));
  const nextId = useRef(initialTurnos.length);
  const turnos = useMemo(
    () =>
      ordenarTurnos(
        draft.map(({ diaSemana, fim, inicio }) => ({ diaSemana, fim, inicio }))
      ),
    [draft]
  );

  const addTurno = useCallback(
    (diaSemana: DiaSemana) => {
      const id = nextId.current;
      nextId.current += 1;
      setDraft((current) => [
        ...current,
        { diaSemana, fim: "", id, inicio: "" },
      ]);
      onEdit();
    },
    [onEdit]
  );

  const changeTurno = useCallback(
    (id: number, field: CampoTurno, value: string) => {
      setDraft((current) =>
        current.map((turno) =>
          turno.id === id ? { ...turno, [field]: value } : turno
        )
      );
      onEdit();
    },
    [onEdit]
  );

  const removeTurno = useCallback(
    (id: number) => {
      setDraft((current) => current.filter((turno) => turno.id !== id));
      onEdit();
    },
    [onEdit]
  );

  const resetDraft = useCallback((nextTurnos: readonly Turno[]) => {
    nextId.current = nextTurnos.length;
    setDraft(toDraft(nextTurnos));
  }, []);

  return { addTurno, changeTurno, draft, removeTurno, resetDraft, turnos };
}
