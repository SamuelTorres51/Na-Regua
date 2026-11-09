import { isValidEmail } from "@/utils/email";
import { MIN_PASSWORD_LENGTH } from "@/utils/password";
import {
  formatPhone,
  MAX_PHONE_DIGITS,
  MIN_PHONE_DIGITS,
  onlyDigits,
} from "@/utils/phone";
import type { NovoProfissionalInput, Profissional } from "./types";

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 150;

export const validationMessages = {
  email: "Informe um e-mail válido.",
  nome: `O nome precisa ter entre ${MIN_NAME_LENGTH} e ${MAX_NAME_LENGTH} caracteres.`,
  senha: `A senha precisa de ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  telefone: "Informe um telefone com DDD (ex.: (86) 99999-0000).",
} as const;

export type ProfessionalFormValues = NovoProfissionalInput;

export type ProfessionalFormErrors = Partial<
  Record<keyof ProfessionalFormValues, string>
>;

export function toProfessionalFormValues(
  profissional: Profissional | null
): ProfessionalFormValues {
  return {
    email: profissional?.email ?? "",
    nome: profissional?.nome ?? "",
    senha: "",
    telefone: formatPhone(profissional?.telefone ?? ""),
  };
}

// No modo de edição, a API só permite alterar nome e telefone.
export function parseProfessionalForm(
  values: ProfessionalFormValues,
  isEditing: boolean
) {
  const nome = values.nome.trim();
  const email = values.email.trim().toLowerCase();
  const telefone = onlyDigits(values.telefone);
  const errors: ProfessionalFormErrors = {};

  if (nome.length < MIN_NAME_LENGTH || nome.length > MAX_NAME_LENGTH) {
    errors.nome = validationMessages.nome;
  }

  if (
    telefone.length < MIN_PHONE_DIGITS ||
    telefone.length > MAX_PHONE_DIGITS
  ) {
    errors.telefone = validationMessages.telefone;
  }

  if (!(isEditing || isValidEmail(email))) {
    errors.email = validationMessages.email;
  }

  if (!isEditing && values.senha.length < MIN_PASSWORD_LENGTH) {
    errors.senha = validationMessages.senha;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, input: null };
  }

  const input: NovoProfissionalInput = {
    email,
    nome,
    senha: values.senha,
    telefone,
  };

  return { errors, input };
}
