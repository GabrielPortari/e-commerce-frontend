import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, Product } from '../../core/models';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly selectedCategoryId = signal<number | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
    });
    this.loadProducts();
  }

  protected onCategoryChange(categoryId: string): void {
    this.selectedCategoryId.set(categoryId ? Number(categoryId) : null);
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    const categoryId = this.selectedCategoryId();

    this.productService.getAll(categoryId ? { category: categoryId } : undefined).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os produtos.');
        this.loading.set(false);
      },
    });
  }
}
