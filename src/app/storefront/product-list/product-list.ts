import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, Product } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Carousel } from '../../shared/components/carousel/carousel';

@Component({
  selector: 'app-product-list',
  imports: [Skeleton, EmptyState, ProductCard, Carousel],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  protected readonly skeletonItems = Array.from({ length: 8 });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
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

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const categoryParam = params.get('category');
      this.selectedCategoryId.set(categoryParam ? Number(categoryParam) : null);
      this.loadProducts();
    });
  }

  protected onCategoryChange(categoryId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: categoryId || null },
      queryParamsHandling: 'merge',
    });
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
