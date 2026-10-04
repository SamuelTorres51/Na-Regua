import { MIN_PASSWORD_LENGTH } from "@/utils/password";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validationMessages = {
  email: "Informe um e-mail válido.",
  password: `A senha precisa de ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
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
