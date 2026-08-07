import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  protected readonly product = signal<Product | null>(null);
  protected readonly quantity = signal(1);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly addingToCart = signal(false);
  protected readonly addedToCart = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Produto não encontrado.');
        this.loading.set(false);
      },
    });
  }

  protected setQuantity(value: string): void {
    const parsed = Number(value);
    if (parsed >= 1) {
      this.quantity.set(parsed);
    }
  }

  protected addToCart(): void {
    const product = this.product();
    if (!product) {
      return;
    }

    this.addingToCart.set(true);
    this.addedToCart.set(false);
    this.cartService.addItem(product.id, this.quantity()).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.addedToCart.set(true);
      },
      error: () => this.addingToCart.set(false),
    });
  }
}
