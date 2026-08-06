import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  protected readonly cartService = inject(CartService);

  protected updateQuantity(itemId: number, value: string): void {
    const quantity = Number(value);
    if (quantity >= 1) {
      this.cartService.updateItemQuantity(itemId, quantity).subscribe();
    }
  }

  protected removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe();
  }

  protected clearCart(): void {
    this.cartService.clear().subscribe();
  }
}
