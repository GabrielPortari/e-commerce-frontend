import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { SettingsService } from '../../core/services/settings.service';
import { ApiError } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { checkoutCartOnWhatsapp } from '../../core/utils/whatsapp-message';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink, Skeleton, EmptyState],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  protected readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  protected readonly settingsService = inject(SettingsService);
  protected readonly skeletonItems = Array.from({ length: 3 });

  protected updateQuantity(itemId: number, value: string): void {
    const quantity = Number(value);
    if (quantity >= 1) {
      this.cartService.updateItemQuantity(itemId, quantity).subscribe({
        error: (err: { error?: ApiError }) =>
          this.toastService.error(err.error?.message ?? 'Não foi possível atualizar a quantidade.'),
      });
    }
  }

  protected removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      error: () => this.toastService.error('Não foi possível remover o item.'),
    });
  }

  protected clearCart(): void {
    this.cartService.clear().subscribe({
      error: () => this.toastService.error('Não foi possível limpar o carrinho.'),
    });
  }

  protected buyOnWhatsapp(): void {
    checkoutCartOnWhatsapp(this.cartService.cart(), this.settingsService, this.toastService);
  }
}
