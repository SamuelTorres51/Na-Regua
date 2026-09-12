const NON_DIGIT_PATTERN = /\D/g;
const AREA_CODE_END = 2;
const PREFIX_END = 7;

export const MAX_PHONE_DIGITS = 11;
export const MIN_PHONE_DIGITS = 10;
export const PHONE_MASK_LENGTH = 15;

export function onlyDigits(value: string) {
  return value.replace(NON_DIGIT_PATTERN, "");
}

export function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, MAX_PHONE_DIGITS);

  if (digits.length <= AREA_CODE_END) {
    return digits;
  }

  if (digits.length <= PREFIX_END) {
    return `(${digits.slice(0, AREA_CODE_END)}) ${digits.slice(AREA_CODE_END)}`;
  }

  return `(${digits.slice(0, AREA_CODE_END)}) ${digits.slice(AREA_CODE_END, PREFIX_END)}-${digits.slice(PREFIX_END)}`;
}
