import { Injectable, inject } from '@angular/core';
import { Cart } from '../models';
import { buildCartWhatsappMessage } from '../utils/whatsapp-message';
import { SettingsService } from './settings.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class WhatsappCheckoutService {
  private readonly settingsService = inject(SettingsService);
  private readonly toastService = inject(ToastService);

  /** Abre o WhatsApp com os itens do carrinho; mostra toast e retorna false se não der certo. */
  checkoutCart(cart: Cart | null): boolean {
    if (!cart || cart.items.length === 0) {
      return false;
    }

    if (this.settingsService.openWhatsapp(buildCartWhatsappMessage(cart))) {
      return true;
    }

    this.toastService.error('Número do WhatsApp da loja ainda não foi configurado.');
    return false;
  }
}
