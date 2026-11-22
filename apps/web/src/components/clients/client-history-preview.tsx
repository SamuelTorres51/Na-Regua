import { Dialog } from "@/components/ui/dialog";
import { CalendarIcon } from "@/components/ui/icons";
import type { Cliente } from "@/features/clients/types";

interface ServiceHistory {
  date: string;
  professional: string;
  service: string;
  time: string;
  value: string;
}

// Exemplos exibidos apenas no modo de demonstração do painel.
const SERVICE_HISTORY: Record<number, ServiceHistory[]> = {
  1: [
    {
      date: "18/10/2026",
      professional: "Rafael Costa",
      service: "Corte degradê",
      time: "09:00",
      value: "R$ 35,00",
    },
    {
      date: "20/09/2026",
      professional: "Rafael Costa",
      service: "Barba",
      time: "14:30",
      value: "R$ 25,00",
    },
  ],
  2: [
    {
      date: "12/10/2026",
      professional: "Lucas Mendes",
      service: "Corte feminino",
      time: "16:00",
      value: "R$ 45,00",
    },
  ],
};

interface ClientHistoryPreviewProps {
  cliente: Cliente;
  onClose: () => void;
}

export function ClientHistoryPreview({
  cliente,
  onClose,
}: ClientHistoryPreviewProps) {
  const history = SERVICE_HISTORY[cliente.id] ?? [];

  return (
    <Dialog
      description={`Serviços realizados para ${cliente.nome}.`}
      isOpen
      onClose={onClose}
      title="Histórico de serviços"
    >
      {history.length ? (
        <div className="flex flex-col gap-3">
          {history.map((item) => (
            <div
              className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4"
              key={`${item.date}-${item.service}`}
            >
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <CalendarIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-roboto-medium text-sm text-white">
                    {item.service}
                  </p>
                  <p className="mt-1 font-roboto text-xs text-zinc-500">
                    {item.date} às {item.time} · {item.professional}
                  </p>
                </div>
              </div>
              <span className="whitespace-nowrap font-roboto-medium text-sm text-zinc-300">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 border-dashed px-5 py-10 text-center">
          <p className="font-roboto-semibold text-sm text-white">
            Nenhum serviço realizado
          </p>
          <p className="mt-2 font-roboto text-xs text-zinc-500">
            O histórico desse cliente aparecerá aqui após o primeiro
            atendimento.
          </p>
        </div>
      )}
    </Dialog>
  );
}
