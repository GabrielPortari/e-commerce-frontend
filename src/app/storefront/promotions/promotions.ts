import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-promotions',
  imports: [Skeleton, EmptyState, ProductCard],
  templateUrl: './promotions.html',
  styleUrl: './promotions.scss',
})
export class Promotions {
  protected readonly skeletonItems = Array.from({ length: 8 });

  private readonly productService = inject(ProductService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.productService.getAll({ onSale: true }).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as promoções.');
        this.loading.set(false);
      },
    });
  }
}
