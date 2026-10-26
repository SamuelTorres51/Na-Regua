import { MIN_PASSWORD_LENGTH } from "@/utils/password";
import { MIN_PHONE_DIGITS, onlyDigits } from "@/utils/phone";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validationMessages = {
  email: "Informe um e-mail válido.",
  emailInUse: "Este e-mail já está em uso por outra conta.",
  fullName: "Informe seu nome e sobrenome.",
  password: `A senha precisa de ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  passwordMismatch: "As senhas não conferem.",
  phone: "Informe um telefone com DDD.",
  terms: "É preciso aceitar os termos para continuar.",
} as const;

type FieldErrors<T extends string> = Partial<Record<T, string>>;

function collectErrors<T extends string>(
  entries: [T, string | undefined][]
): FieldErrors<T> {
  const errors: FieldErrors<T> = {};

  for (const [field, message] of entries) {
    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}

export function validateFullName(fullName: string) {
  return fullName.trim().includes(" ")
    ? undefined
    : validationMessages.fullName;
}

export function validateEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim())
    ? undefined
    : validationMessages.email;
}

export function validatePhone(phone: string) {
  return onlyDigits(phone).length >= MIN_PHONE_DIGITS
    ? undefined
    : validationMessages.phone;
}

export function validatePassword(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH
    ? undefined
    : validationMessages.password;
}

export interface LoginValues {
  email: string;
  password: string;
}

export type LoginErrors = FieldErrors<keyof LoginValues>;

export function validateLogin({ email, password }: LoginValues): LoginErrors {
  return collectErrors<keyof LoginValues>([
    ["email", validateEmail(email)],
    ["password", validatePassword(password)],
  ]);
}

export interface RegisterValues {
  confirmPassword: string;
  email: string;
  fullName: string;
  hasAcceptedTerms: boolean;
  password: string;
  phone: string;
}

export type RegisterErrors = FieldErrors<keyof RegisterValues>;

export function validateRegister({
  confirmPassword,
  email,
  fullName,
  hasAcceptedTerms,
  password,
  phone,
}: RegisterValues): RegisterErrors {
  return collectErrors<keyof RegisterValues>([
    ["fullName", validateFullName(fullName)],
    ["email", validateEmail(email)],
    ["phone", validatePhone(phone)],
    ["password", validatePassword(password)],
    [
      "confirmPassword",
      confirmPassword === password
        ? undefined
        : validationMessages.passwordMismatch,
    ],
    [
      "hasAcceptedTerms",
      hasAcceptedTerms ? undefined : validationMessages.terms,
    ],
  ]);
}

export interface ProfileValues {
  email: string;
  fullName: string;
  phone: string;
}

export type ProfileErrors = FieldErrors<keyof ProfileValues>;

export function validateProfile({
  email,
  fullName,
  phone,
}: ProfileValues): ProfileErrors {
  return collectErrors<keyof ProfileValues>([
    ["fullName", validateFullName(fullName)],
    ["email", validateEmail(email)],
    ["phone", validatePhone(phone)],
  ]);
}
