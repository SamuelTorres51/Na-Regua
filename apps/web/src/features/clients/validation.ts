import { isValidEmail } from "@/utils/email";
import { MIN_PASSWORD_LENGTH } from "@/utils/password";
import type { Cliente, NovoClienteInput } from "./types";

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 150;
const MAX_EMAIL_LENGTH = 150;
const MIN_PHONE_LENGTH = 10;
const MAX_PHONE_LENGTH = 20;
// O bcrypt usado pela API limita a senha a 72 bytes em UTF-8.
const MAX_PASSWORD_BYTES = 72;

export type ClientFormErrors = Partial<Record<keyof NovoClienteInput, string>>;

export function toClientFormValues(cliente: Cliente | null): NovoClienteInput {
  return {
    email: cliente?.email ?? "",
    nome: cliente?.nome ?? "",
    senha: "",
    telefone: cliente?.telefone ?? "",
  };
}

export function parseClientForm(values: NovoClienteInput, isEditing: boolean) {
  const input = {
    email: values.email.trim().toLowerCase(),
    nome: values.nome.trim(),
    senha: values.senha,
    telefone: values.telefone.trim(),
  };
  const errors: ClientFormErrors = {};
  const nameLength = Array.from(input.nome).length;
  const phoneLength = Array.from(input.telefone).length;

  if (nameLength < MIN_NAME_LENGTH || nameLength > MAX_NAME_LENGTH) {
    errors.nome = `O nome precisa ter entre ${MIN_NAME_LENGTH} e ${MAX_NAME_LENGTH} caracteres.`;
  }
  if (!isValidEmail(input.email)) {
    errors.email = "Informe um e-mail válido.";
  } else if (Array.from(input.email).length > MAX_EMAIL_LENGTH) {
    errors.email = `O e-mail precisa ter até ${MAX_EMAIL_LENGTH} caracteres.`;
  }
  if (phoneLength < MIN_PHONE_LENGTH || phoneLength > MAX_PHONE_LENGTH) {
    errors.telefone = `O telefone precisa ter entre ${MIN_PHONE_LENGTH} e ${MAX_PHONE_LENGTH} caracteres.`;
  }
  if (!isEditing) {
    if (Array.from(input.senha).length < MIN_PASSWORD_LENGTH) {
      errors.senha = `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    } else if (
      new TextEncoder().encode(input.senha).length > MAX_PASSWORD_BYTES
    ) {
      errors.senha = "A senha excede o tamanho aceito. Use menos caracteres.";
    }
  }

  return { errors, input: Object.keys(errors).length === 0 ? input : null };
}
