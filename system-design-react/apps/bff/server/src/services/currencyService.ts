import currencyData from "../data/currencies.json" with { type: "json" };

const rates = currencyData.rates as Record<string, number>;

export function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = rates[fromCurrency];
  if (rate === undefined) {
    throw new Error(`Unknown currency: ${fromCurrency}`);
  }
  return amount * rate;
}
