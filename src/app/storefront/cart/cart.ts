import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ApiError } from '../../core/models';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  protected readonly cartService = inject(CartService);
  protected readonly actionError = signal<string | null>(null);

  protected updateQuantity(itemId: number, value: string): void {
    const quantity = Number(value);
    if (quantity >= 1) {
      this.cartService.updateItemQuantity(itemId, quantity).subscribe({
        next: () => this.actionError.set(null),
        error: (err: { error?: ApiError }) =>
          this.actionError.set(err.error?.message ?? 'Não foi possível atualizar a quantidade.'),
      });
    }
  }

  protected removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      next: () => this.actionError.set(null),
      error: () => this.actionError.set('Não foi possível remover o item.'),
    });
  }

  protected clearCart(): void {
    this.cartService.clear().subscribe({
      next: () => this.actionError.set(null),
      error: () => this.actionError.set('Não foi possível limpar o carrinho.'),
    });
  }
}
