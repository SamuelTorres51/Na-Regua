const DIGIT_PATTERN = /\d/;
const SYMBOL_PATTERN = /[^A-Za-z0-9]/;
const UPPERCASE_PATTERN = /[A-Z]/;

export const MAX_PASSWORD_SCORE = 4;
export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_SCORE_LABELS = [
  "",
  "Fraca",
  "Razoável",
  "Boa",
  "Forte",
] as const;

export function getPasswordScore(value: string) {
  const checks = [
    value.length >= MIN_PASSWORD_LENGTH,
    UPPERCASE_PATTERN.test(value),
    DIGIT_PATTERN.test(value),
    SYMBOL_PATTERN.test(value),
  ];

  return checks.filter(Boolean).length;
}
