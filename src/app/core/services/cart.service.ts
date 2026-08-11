import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Cart } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);

  private readonly _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(
    () => this._cart()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  constructor() {
    this.load();
  }

  load(): void {
    this._loading.set(true);
    this._error.set(null);
    this.api.get<Cart>('/cart').subscribe({
      next: (cart) => {
        this._cart.set(cart);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Não foi possível carregar o carrinho.');
        this._loading.set(false);
      },
    });
  }

  addItem(productId: number, quantity: number): Observable<Cart> {
    return this.syncCart(this.api.post<Cart>('/cart/items', { productId, quantity }));
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.syncCart(this.api.put<Cart>(`/cart/items/${itemId}`, { quantity }));
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.syncCart(this.api.delete<Cart>(`/cart/items/${itemId}`));
  }

  clear(): Observable<Cart> {
    return this.syncCart(this.api.delete<Cart>('/cart'));
  }

  private syncCart(source: Observable<Cart>): Observable<Cart> {
    return source.pipe(
      tap((cart) => {
        this._cart.set(cart);
        this._error.set(null);
      })
    );
  }
}
