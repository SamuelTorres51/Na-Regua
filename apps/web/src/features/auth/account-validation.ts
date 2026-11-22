import { isValidEmail } from "@/utils/email";
import { isPasswordTooLong, MIN_PASSWORD_LENGTH } from "@/utils/password";
import type {
  AlterarSenhaInput,
  AtualizarPerfilInput,
  DadosPerfil,
} from "./types";

export type ProfileErrors = Partial<Record<keyof DadosPerfil, string>>;

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 150;
const MAX_EMAIL_LENGTH = 150;
const MIN_PHONE_LENGTH = 10;
const MAX_PHONE_LENGTH = 20;

export function toProfileValues({
  email,
  nome,
  telefone,
}: DadosPerfil): DadosPerfil {
  return { email, nome, telefone };
}

export function getProfileChanges(values: DadosPerfil, saved: DadosPerfil) {
  const changes: AtualizarPerfilInput = {};
  const email = values.email.trim().toLowerCase();
  const nome = values.nome.trim();
  const telefone = values.telefone.trim();

  if (email !== saved.email.trim().toLowerCase()) {
    changes.email = email;
  }
  if (nome !== saved.nome.trim()) {
    changes.nome = nome;
  }
  if (telefone !== saved.telefone.trim()) {
    changes.telefone = telefone;
  }

  return changes;
}

export function validateProfileChanges({
  email,
  nome,
  telefone,
}: AtualizarPerfilInput) {
  const errors: ProfileErrors = {};

  if (nome !== undefined) {
    const { length } = Array.from(nome);
    if (length < MIN_NAME_LENGTH || length > MAX_NAME_LENGTH) {
      errors.nome = `O nome precisa ter entre ${MIN_NAME_LENGTH} e ${MAX_NAME_LENGTH} caracteres.`;
    }
  }
  if (email !== undefined) {
    if (!isValidEmail(email)) {
      errors.email = "Informe um e-mail válido.";
    } else if (Array.from(email).length > MAX_EMAIL_LENGTH) {
      errors.email = `O e-mail precisa ter até ${MAX_EMAIL_LENGTH} caracteres.`;
    }
  }
  if (telefone !== undefined) {
    const { length } = Array.from(telefone);
    if (length < MIN_PHONE_LENGTH || length > MAX_PHONE_LENGTH) {
      errors.telefone = `O telefone precisa ter entre ${MIN_PHONE_LENGTH} e ${MAX_PHONE_LENGTH} caracteres.`;
    }
  }

  return errors;
}

export interface PasswordValues extends AlterarSenhaInput {
  confirmacao: string;
}

export type PasswordErrors = Partial<Record<keyof PasswordValues, string>>;

export function validatePasswordChange({
  confirmacao,
  novaSenha,
  senhaAtual,
}: PasswordValues) {
  const errors: PasswordErrors = {};

  if (senhaAtual.length === 0) {
    errors.senhaAtual = "Informe a senha atual.";
  } else if (isPasswordTooLong(senhaAtual)) {
    errors.senhaAtual = "A senha atual excede o tamanho aceito.";
  }

  if (Array.from(novaSenha).length < MIN_PASSWORD_LENGTH) {
    errors.novaSenha = `A nova senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  } else if (isPasswordTooLong(novaSenha)) {
    errors.novaSenha =
      "A nova senha excede o tamanho aceito. Use menos caracteres.";
  } else if (novaSenha === senhaAtual) {
    errors.novaSenha = "A nova senha precisa ser diferente da atual.";
  }

  if (confirmacao.length === 0) {
    errors.confirmacao = "Confirme a nova senha.";
  } else if (confirmacao !== novaSenha) {
    errors.confirmacao = "As senhas precisam coincidir.";
  }

  return errors;
}
