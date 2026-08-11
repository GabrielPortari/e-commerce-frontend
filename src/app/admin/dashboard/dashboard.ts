import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, Product } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Skeleton],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  protected readonly loading = signal(true);
  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);

  protected readonly activeCount = computed(
    () => this.products().filter((product) => product.active).length
  );
  protected readonly outOfStockCount = computed(
    () => this.products().filter((product) => product.active && product.stock === 0).length
  );
  protected readonly onSaleCount = computed(
    () => this.products().filter((product) => product.active && product.onSale).length
  );
  protected readonly featuredCount = computed(
    () => this.products().filter((product) => product.active && product.featured).length
  );

  constructor() {
    this.productService.getAllAdmin().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.categoryService.getAll().subscribe({ next: (categories) => this.categories.set(categories) });
  }
}
