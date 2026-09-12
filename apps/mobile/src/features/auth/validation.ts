import { MIN_PASSWORD_LENGTH } from "@/utils/password";
import { MIN_PHONE_DIGITS, onlyDigits } from "@/utils/phone";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validationMessages = {
  email: "Informe um e-mail válido.",
  fullName: "Informe seu nome e sobrenome.",
  password: `A senha precisa de ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  passwordMismatch: "As senhas não conferem.",
  phone: "Informe um telefone com DDD.",
  terms: "É preciso aceitar os termos para continuar.",
} as const;

export interface LoginValues {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export function validateLogin({ email, password }: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = validationMessages.email;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = validationMessages.password;
  }

  return errors;
}

export interface RegisterValues {
  confirmPassword: string;
  email: string;
  fullName: string;
  hasAcceptedTerms: boolean;
  password: string;
  phone: string;
}

export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

export function validateRegister({
  confirmPassword,
  email,
  fullName,
  hasAcceptedTerms,
  password,
  phone,
}: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!fullName.trim().includes(" ")) {
    errors.fullName = validationMessages.fullName;
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = validationMessages.email;
  }

  if (onlyDigits(phone).length < MIN_PHONE_DIGITS) {
    errors.phone = validationMessages.phone;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = validationMessages.password;
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = validationMessages.passwordMismatch;
  }

  if (!hasAcceptedTerms) {
    errors.hasAcceptedTerms = validationMessages.terms;
  }

  return errors;
}
