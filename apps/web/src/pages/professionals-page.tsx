// biome-ignore-all lint/performance/noJsxPropsBind: cards and filters depend on local professional state
import { useMemo, useState } from "react";

import { ClockIcon, HistoryIcon, SearchIcon } from "@/components/ui/icons";

interface Appointment {
  client: string;
  date: string;
  service: string;
  time: string;
}

interface Professional {
  appointments: Appointment[];
  availability: string[];
  email: string;
  history: Appointment[];
  id: number;
  name: string;
  phone: string;
  role: string;
  status: "Ativo" | "Folga";
  totalAppointments: number;
}

const PROFESSIONALS: Professional[] = [
  {
    appointments: [
      {
        client: "Carlos Eduardo Silva",
        date: "25/10/2026",
        service: "Corte degradê",
        time: "09:00",
      },
      {
        client: "Mariana Oliveira",
        date: "25/10/2026",
        service: "Barba",
        time: "10:30",
      },
      {
        client: "João Pedro Santos",
        date: "26/10/2026",
        service: "Corte + barba",
        time: "14:00",
      },
    ],
    availability: [
      "Segunda · 09:00 – 18:00",
      "Terça · 09:00 – 18:00",
      "Quarta · 09:00 – 18:00",
      "Sexta · 10:00 – 19:00",
      "Sábado · 08:00 – 16:00",
    ],
    email: "rafael.costa@naregua.com",
    history: [
      {
        client: "Carlos Eduardo Silva",
        date: "18/10/2026",
        service: "Corte degradê",
        time: "09:00",
      },
      {
        client: "Pedro Alves",
        date: "15/10/2026",
        service: "Corte + barba",
        time: "15:30",
      },
    ],
    id: 1,
    name: "Rafael Costa",
    phone: "(86) 99999-1001",
    role: "Barbeiro especialista",
    status: "Ativo",
    totalAppointments: 86,
  },
  {
    appointments: [
      {
        client: "Ana Beatriz Lima",
        date: "25/10/2026",
        service: "Corte feminino",
        time: "11:00",
      },
      {
        client: "Lucas Martins",
        date: "25/10/2026",
        service: "Corte social",
        time: "15:00",
      },
    ],
    availability: [
      "Terça · 09:00 – 18:00",
      "Quarta · 09:00 – 18:00",
      "Quinta · 09:00 – 18:00",
      "Sexta · 09:00 – 18:00",
      "Sábado · 08:00 – 16:00",
    ],
    email: "lucas.mendes@naregua.com",
    history: [
      {
        client: "Ana Beatriz Lima",
        date: "20/10/2026",
        service: "Corte feminino",
        time: "11:00",
      },
    ],
    id: 2,
    name: "Lucas Mendes",
    phone: "(86) 98888-2002",
    role: "Cabeleireiro",
    status: "Ativo",
    totalAppointments: 64,
  },
  {
    appointments: [],
    availability: ["Quinta · 12:00 – 20:00", "Sexta · 12:00 – 20:00"],
    email: "bruno.santos@naregua.com",
    history: [
      {
        client: "Marcos Vinícius",
        date: "17/10/2026",
        service: "Barba",
        time: "13:30",
      },
    ],
    id: 3,
    name: "Bruno Santos",
    phone: "(86) 97777-3003",
    role: "Barbeiro",
    status: "Folga",
    totalAppointments: 41,
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <ClockIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-roboto-medium text-sm text-white">
            {appointment.client}
          </p>
          <span className="font-roboto-semibold text-brand text-sm">
            {appointment.time}
          </span>
        </div>
        <p className="mt-1 font-roboto text-xs text-zinc-500">
          {appointment.service} · {appointment.date}
        </p>
      </div>
    </div>
  );
}

export function ProfessionalsPage() {
  const [selectedId, setSelectedId] = useState(PROFESSIONALS[0].id);
  const [search, setSearch] = useState("");

  const filteredProfessionals = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();

    if (!term) {
      return PROFESSIONALS;
    }

    return PROFESSIONALS.filter((professional) =>
      [professional.name, professional.role].some((value) =>
        value.toLocaleLowerCase().includes(term)
      )
    );
  }, [search]);

  const selectedProfessional =
    PROFESSIONALS.find((professional) => professional.id === selectedId) ??
    filteredProfessionals[0] ??
    PROFESSIONALS[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-roboto text-sm text-zinc-500">Equipe</p>
        <h1 className="mt-1 font-roboto-bold text-2xl text-white">
          Profissionais
        </h1>
        <p className="mt-2 font-roboto text-sm text-zinc-400">
          Acompanhe a equipe, os horários e os atendimentos realizados.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4">
        <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
        <input
          aria-label="Buscar profissionais"
          className="h-12 min-w-0 flex-1 bg-transparent font-roboto text-sm text-white outline-none placeholder:text-zinc-600"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou especialidade"
          type="search"
          value={search}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-roboto-semibold text-base text-white">
            Sua equipe
          </h2>
          <span className="font-roboto text-xs text-zinc-500">
            {filteredProfessionals.length} profissionais
          </span>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {filteredProfessionals.map((professional) => {
            const isSelected = professional.id === selectedProfessional.id;

            return (
              <button
                className={`rounded-3xl border p-5 text-left transition ${
                  isSelected
                    ? "border-brand/60 bg-brand/5"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                }`}
                key={professional.id}
                onClick={() => setSelectedId(professional.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 font-roboto-bold text-brand">
                      {getInitials(professional.name)}
                    </span>
                    <div>
                      <p className="font-roboto-semibold text-sm text-white">
                        {professional.name}
                      </p>
                      <p className="mt-1 font-roboto text-xs text-zinc-500">
                        {professional.role}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      professional.status === "Ativo"
                        ? "rounded-full bg-emerald-400/10 px-2.5 py-1 font-roboto-medium text-[11px] text-emerald-400"
                        : "rounded-full bg-zinc-800 px-2.5 py-1 font-roboto-medium text-[11px] text-zinc-400"
                    }
                  >
                    {professional.status}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 border-zinc-800 border-t pt-4">
                  <div>
                    <p className="font-roboto-bold text-white">
                      {professional.totalAppointments}
                    </p>
                    <p className="mt-1 font-roboto text-[11px] text-zinc-500">
                      atendimentos
                    </p>
                  </div>
                  <div>
                    <p className="font-roboto-bold text-white">
                      {professional.appointments.length}
                    </p>
                    <p className="mt-1 font-roboto text-[11px] text-zinc-500">
                      agendados
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand/15 font-roboto-bold text-2xl text-brand">
                  {getInitials(selectedProfessional.name)}
                </span>
                <div>
                  <h2 className="font-roboto-bold text-white text-xl">
                    {selectedProfessional.name}
                  </h2>
                  <p className="mt-1 font-roboto text-sm text-zinc-400">
                    {selectedProfessional.role}
                  </p>
                  <p className="mt-2 font-roboto text-xs text-zinc-500">
                    {selectedProfessional.phone} · {selectedProfessional.email}
                  </p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1.5 font-roboto-medium text-emerald-400 text-xs">
                {selectedProfessional.status}
              </span>
            </div>
            <div className="mt-6">
              <div className="rounded-2xl bg-zinc-950/40 p-4">
                <p className="font-roboto text-xs text-zinc-500">
                  Atendimentos
                </p>
                <p className="mt-2 font-roboto-bold text-white text-xl">
                  {selectedProfessional.totalAppointments}
                </p>
                <p className="mt-1 font-roboto text-emerald-400 text-xs">
                  neste mês
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-roboto-semibold text-base text-white">
                  Próximos horários agendados
                </h2>
                <p className="mt-1 font-roboto text-xs text-zinc-500">
                  Compromissos confirmados deste profissional.
                </p>
              </div>
              <ClockIcon className="h-5 w-5 text-brand" />
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {selectedProfessional.appointments.length > 0 ? (
                selectedProfessional.appointments.map((appointment) => (
                  <AppointmentRow
                    appointment={appointment}
                    key={`${appointment.date}-${appointment.time}-${appointment.client}`}
                  />
                ))
              ) : (
                <p className="rounded-2xl border border-zinc-800 border-dashed px-5 py-8 text-center font-roboto text-sm text-zinc-500">
                  Nenhum horário agendado para este profissional.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-roboto-semibold text-base text-white">
                  Horários disponíveis
                </h2>
                <p className="mt-1 font-roboto text-xs text-zinc-500">
                  Grade semanal de atendimento.
                </p>
              </div>
              <ClockIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="mt-5 flex flex-col gap-2">
              {selectedProfessional.availability.map((slot) => (
                <div
                  className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2.5 font-roboto text-sm text-zinc-300"
                  key={slot}
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-roboto-semibold text-base text-white">
                  Histórico de atendimentos
                </h2>
                <p className="mt-1 font-roboto text-xs text-zinc-500">
                  Serviços concluídos recentemente.
                </p>
              </div>
              <HistoryIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {selectedProfessional.history.map((appointment) => (
                <AppointmentRow
                  appointment={appointment}
                  key={`${appointment.date}-${appointment.time}-${appointment.client}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
