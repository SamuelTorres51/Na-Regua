const CURRENCY_NOISE_PATTERN = /R\$|\s/g;
const THOUSANDS_SEPARATOR_PATTERN = /\./g;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatPriceInput(value: number) {
  return value.toFixed(2).replace(".", ",");
}

// Aceita "35", "35,5", "35,50", "1.035,00" e "35.50".
export function parsePrice(value: string) {
  const cleaned = value.replace(CURRENCY_NOISE_PATTERN, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(THOUSANDS_SEPARATOR_PATTERN, "").replace(",", ".")
    : cleaned;

  return PRICE_PATTERN.test(normalized) ? Number(normalized) : null;
}
