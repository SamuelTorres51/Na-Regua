// biome-ignore-all lint/performance/noJsxPropsBind: cards and actions depend on the selected professional
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { ProfessionalFormDialog } from "@/components/professionals/professional-form-dialog";
import { ActiveBadge } from "@/components/ui/active-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { ClockIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { ErrorPanel, LoadingPanel } from "@/components/ui/state-panels";
import type {
  NovoProfissionalInput,
  Profissional,
} from "@/features/professionals/types";
import { useProfessionals } from "@/features/professionals/use-professionals";
import { getApiErrorMessage } from "@/services/api-client";
import { formatPhone, onlyDigits } from "@/utils/phone";

const STATUS_ERROR_MESSAGE =
  "Não foi possível alterar o status do profissional. Tente novamente.";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function matchesSearch({ email, nome, telefone }: Profissional, term: string) {
  const digits = onlyDigits(term);

  return (
    nome.toLocaleLowerCase().includes(term) ||
    email.toLocaleLowerCase().includes(term) ||
    (digits.length > 0 && telefone.includes(digits))
  );
}

export function ProfessionalsPage() {
  const {
    changeProfissionalAtivo,
    error,
    isLoading,
    profissionais,
    saveProfissional,
  } = useProfessionals();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] =
    useState<Profissional | null>(null);
  const [profissionalToInactivate, setProfissionalToInactivate] =
    useState<Profissional | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const filteredProfissionais = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();

    return term
      ? profissionais.filter((profissional) =>
          matchesSearch(profissional, term)
        )
      : profissionais;
  }, [profissionais, search]);

  const selectedProfissional =
    filteredProfissionais.find(
      (profissional) => profissional.id === selectedId
    ) ??
    filteredProfissionais[0] ??
    null;

  const selectProfissional = useCallback((id: number) => {
    setSelectedId(id);
    setStatusError(null);
  }, []);

  const openCreateDialog = useCallback(() => {
    setEditingProfissional(null);
    setIsFormOpen(true);
  }, []);

  const openEditDialog = useCallback((profissional: Profissional) => {
    setEditingProfissional(profissional);
    setIsFormOpen(true);
  }, []);

  const closeFormDialog = useCallback(() => setIsFormOpen(false), []);

  const handleSave = useCallback(
    async (input: NovoProfissionalInput) => {
      const saved = await saveProfissional(input, editingProfissional?.id);
      setSelectedId(saved.id);
    },
    [editingProfissional, saveProfissional]
  );

  const changeStatus = useCallback(
    async (profissional: Profissional, ativo: boolean) => {
      setIsChangingStatus(true);
      setStatusError(null);

      try {
        await changeProfissionalAtivo(profissional.id, ativo);
        setProfissionalToInactivate(null);
      } catch (statusFailure) {
        setStatusError(getApiErrorMessage(statusFailure, STATUS_ERROR_MESSAGE));
      } finally {
        setIsChangingStatus(false);
      }
    },
    [changeProfissionalAtivo]
  );

  const openInactivateDialog = useCallback((profissional: Profissional) => {
    setStatusError(null);
    setProfissionalToInactivate(profissional);
  }, []);

  const closeInactivateDialog = useCallback(
    () => setProfissionalToInactivate(null),
    []
  );

  const confirmInactivate = useCallback(() => {
    if (profissionalToInactivate) {
      changeStatus(profissionalToInactivate, false);
    }
  }, [changeStatus, profissionalToInactivate]);

  let content = (
    <p className="rounded-3xl border border-zinc-800 border-dashed px-6 py-16 text-center font-roboto text-sm text-zinc-500">
      {profissionais.length === 0
        ? "Nenhum profissional cadastrado. Cadastre o primeiro da sua equipe."
        : "Nenhum profissional encontrado para essa busca."}
    </p>
  );

  if (selectedProfissional) {
    content = (
      <>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-roboto-semibold text-base text-white">
              Sua equipe
            </h2>
            <span className="font-roboto text-xs text-zinc-500">
              {filteredProfissionais.length}{" "}
              {filteredProfissionais.length === 1
                ? "profissional"
                : "profissionais"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProfissionais.map((profissional) => {
              const isSelected = profissional.id === selectedProfissional.id;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`rounded-3xl border p-5 text-left transition ${
                    isSelected
                      ? "border-brand/60 bg-brand/5"
                      : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                  }`}
                  key={profissional.id}
                  onClick={() => selectProfissional(profissional.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 font-roboto-bold text-brand">
                        {getInitials(profissional.nome)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-roboto-semibold text-sm text-white">
                          {profissional.nome}
                        </p>
                        <p className="mt-1 truncate font-roboto text-xs text-zinc-500">
                          {profissional.email}
                        </p>
                      </div>
                    </div>
                    <ActiveBadge ativo={profissional.ativo} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-brand/15 font-roboto-bold text-2xl text-brand">
                  {getInitials(selectedProfissional.nome)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-roboto-bold text-white text-xl">
                    {selectedProfissional.nome}
                  </h2>
                  <p className="mt-1 font-roboto text-sm text-zinc-400">
                    {formatPhone(selectedProfissional.telefone)}
                  </p>
                  <p className="mt-1 truncate font-roboto text-xs text-zinc-500">
                    {selectedProfissional.email}
                  </p>
                </div>
              </div>
              <ActiveBadge ativo={selectedProfissional.ativo} />
            </div>

            {statusError && !profissionalToInactivate ? (
              <div className="mt-5">
                <FormAlert message={statusError} />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3 border-zinc-800 border-t pt-5">
              <button
                className="h-10 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
                onClick={() => openEditDialog(selectedProfissional)}
                type="button"
              >
                Editar dados
              </button>
              {selectedProfissional.ativo ? (
                <button
                  className="h-10 rounded-xl border border-danger/40 px-4 font-roboto-medium text-danger text-sm transition hover:bg-danger/10"
                  onClick={() => openInactivateDialog(selectedProfissional)}
                  type="button"
                >
                  Inativar
                </button>
              ) : (
                <button
                  className="h-10 rounded-xl border border-brand/40 px-4 font-roboto-medium text-brand text-sm transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isChangingStatus}
                  onClick={() => changeStatus(selectedProfissional, true)}
                  type="button"
                >
                  {isChangingStatus ? "Reativando..." : "Reativar"}
                </button>
              )}
            </div>
          </div>

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
            <div className="mt-5 rounded-2xl border border-zinc-800 border-dashed px-5 py-8 text-center">
              <span className="font-roboto text-[10px] text-zinc-500 uppercase tracking-wide">
                em breve
              </span>
              <p className="mt-2 font-roboto text-sm text-zinc-400">
                A grade de horários do profissional vai aparecer aqui.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  let body: ReactNode = content;

  if (isLoading) {
    body = <LoadingPanel label="Carregando profissionais..." />;
  } else if (error) {
    body = <ErrorPanel message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-roboto text-sm text-zinc-500">Equipe</p>
          <h1 className="mt-1 font-roboto-bold text-2xl text-white">
            Profissionais
          </h1>
          <p className="mt-2 font-roboto text-sm text-zinc-400">
            Cadastre e gerencie os profissionais da sua barbearia.
          </p>
        </div>
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110"
          onClick={openCreateDialog}
          type="button"
        >
          <PlusIcon className="h-4 w-4" />
          Novo profissional
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4">
        <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
        <input
          aria-label="Buscar profissionais"
          className="h-12 min-w-0 flex-1 bg-transparent font-roboto text-sm text-white outline-none placeholder:text-zinc-600"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone"
          type="search"
          value={search}
        />
      </div>

      {body}

      {isFormOpen ? (
        <ProfessionalFormDialog
          onClose={closeFormDialog}
          onSave={handleSave}
          profissional={editingProfissional}
        />
      ) : null}

      <ConfirmDialog
        confirmLabel="Inativar"
        description={`${profissionalToInactivate?.nome ?? "O profissional"} não vai mais conseguir entrar no painel e deixará de ser oferecido para novos agendamentos. O histórico é mantido, e você pode reativá-lo depois.`}
        error={statusError}
        isLoading={isChangingStatus}
        isOpen={profissionalToInactivate !== null}
        onClose={closeInactivateDialog}
        onConfirm={confirmInactivate}
        title="Inativar profissional?"
      />
    </div>
  );
}
