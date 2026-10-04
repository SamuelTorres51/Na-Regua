const CENTS_IN_UNIT = 100;
const DECIMAL_PLACES = 2;
const THOUSANDS_PATTERN = /\B(?=(\d{3})+(?!\d))/g;

export function formatPrice(priceInCents: number) {
  const [integerPart, decimalPart] = (priceInCents / CENTS_IN_UNIT)
    .toFixed(DECIMAL_PLACES)
    .split(".");

  return `R$ ${integerPart.replace(THOUSANDS_PATTERN, ".")},${decimalPart}`;
}
