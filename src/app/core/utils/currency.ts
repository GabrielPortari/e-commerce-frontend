// 'en-US' para bater com o CurrencyPipe usado no resto da app (LOCALE_ID não é
// registrado, então o Angular usa o locale default 'en-US' — ex: "R$1,234.50").
const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BRL' });

export function formatCurrencyBRL(value: number): string {
  return formatter.format(value);
}
