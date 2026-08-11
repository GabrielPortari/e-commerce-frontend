import { Cart } from '../models';
import { SettingsService } from '../services/settings.service';
import { ToastService } from '../services/toast.service';
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

/** Abre o WhatsApp com os itens do carrinho; mostra toast e retorna false se não der certo. */
export function checkoutCartOnWhatsapp(
  cart: Cart | null,
  settingsService: SettingsService,
  toastService: ToastService
): boolean {
  if (!cart || cart.items.length === 0) {
    return false;
  }

  if (settingsService.openWhatsapp(buildCartWhatsappMessage(cart))) {
    return true;
  }

  toastService.error('Número do WhatsApp da loja ainda não foi configurado.');
  return false;
}
