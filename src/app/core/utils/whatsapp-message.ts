import { Cart } from '../models';
import { formatCurrencyBRL } from './currency';

export function buildCartWhatsappMessage(cart: Cart): string {
  const lines = cart.items.map(
    (item, index) => `${index + 1}. ${item.productName} (x${item.quantity}) - ${formatCurrencyBRL(item.subtotal)}`
  );

  return [
    'Olá! Gostaria de comprar os seguintes itens:',
    '',
    ...lines,
    '',
    `Total: ${formatCurrencyBRL(cart.total)}`,
  ].join('\n');
}
