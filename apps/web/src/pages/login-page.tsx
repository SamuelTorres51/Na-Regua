import type { FormEvent } from "react";
import { useCallback } from "react";

import { GradientBackground } from "@/components/layout/gradient-background";
import { BrandMark } from "@/components/ui/brand-mark";
import { FormAlert } from "@/components/ui/form-alert";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import { TextLink } from "@/components/ui/text-link";
import { useLoginForm } from "@/features/auth/use-login-form";

const HIGHLIGHTS = [
  "Agenda consolidada de todos os profissionais.",
  "Cadastro de serviços, clientes e funcionários.",
  "Histórico de atendimentos em um só lugar.",
];

interface LoginPageProps {
  onAuthenticated?: () => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const {
    email,
    errors,
    handleRecoverPassword,
    handleSubmit,
    isSubmitting,
    password,
    setEmail,
    setPassword,
    submitError,
  } = useLoginForm({ onSuccess: onAuthenticated });

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSubmit();
    },
    [handleSubmit]
  );

  return (
    <GradientBackground>
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-20">
        <aside className="hidden flex-col lg:flex">
          <BrandMark />

          <h2 className="mt-10 max-w-md font-roboto-bold text-5xl text-white leading-[1.05]">
            A sua barbearia, no seu tempo.
          </h2>
          <p className="mt-5 max-w-md font-roboto text-lg text-zinc-400">
            O painel administrativo da Na Régua para gerenciar a rotina do seu
            estabelecimento.
          </p>

          <ul className="mt-10 flex flex-col gap-3">
            {HIGHLIGHTS.map((highlight) => (
              <li
                className="flex items-center gap-3 font-roboto text-sm text-zinc-300"
                key={highlight}
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                />
                {highlight}
              </li>
            ))}
          </ul>
        </aside>

        <section className="w-full max-w-md justify-self-center rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-10">
          <BrandMark className="mb-8 lg:hidden" />

          <ScreenHeader
            subtitle="Entre para gerenciar a sua barbearia."
            title="Bem-vindo de volta"
          />

          <form
            className="mt-10 flex flex-col gap-5"
            noValidate
            onSubmit={handleFormSubmit}
          >
            <TextField
              autoComplete="email"
              error={errors.email}
              label="E-mail"
              name="email"
              onChange={setEmail}
              placeholder="voce@email.com"
              type="email"
              value={email}
            />

            <TextField
              autoComplete="current-password"
              error={errors.password}
              label="Senha"
              name="password"
              onChange={setPassword}
              placeholder="••••••••"
              type="password"
              value={password}
            />

            <div className="-mt-1 flex justify-end">
              <TextLink
                label="Esqueci minha senha"
                onClick={handleRecoverPassword}
              />
            </div>

            {submitError ? <FormAlert message={submitError} /> : null}

            <PrimaryButton isLoading={isSubmitting} label="Entrar" />
          </form>

          <p className="mt-8 text-center font-roboto text-xs text-zinc-500">
            Acesso restrito a administradores e funcionários.
          </p>
        </section>
      </div>
    </GradientBackground>
  );
}
