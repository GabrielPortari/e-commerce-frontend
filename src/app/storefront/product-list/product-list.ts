import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, Product } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ProductCard } from '../../shared/components/product-card/product-card';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-product-list',
  imports: [Skeleton, EmptyState, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  protected readonly skeletonItems = Array.from({ length: 8 });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly searchInput$ = new Subject<string>();

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly selectedCategoryId = signal<number | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly currentPage = signal(1);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly selectedCategoryName = computed(
    () => this.categories().find((category) => category.id === this.selectedCategoryId())?.name ?? null
  );

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.products().length / PAGE_SIZE))
  );
  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1)
  );
  protected readonly pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.products().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const categoryParam = params.get('category');
      this.selectedCategoryId.set(categoryParam ? Number(categoryParam) : null);
      this.searchTerm.set(params.get('name') ?? '');
      this.currentPage.set(1);
      this.loadProducts();
    });

    this.searchInput$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.navigateWithSearch(term));
  }

  protected onCategoryChange(categoryId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: categoryId || null },
      queryParamsHandling: 'merge',
    });
  }

  protected onSearchInput(term: string): void {
    this.searchTerm.set(term);
    this.searchInput$.next(term);
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  private navigateWithSearch(term: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { name: term.trim() || null },
      queryParamsHandling: 'merge',
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    const categoryId = this.selectedCategoryId();
    const name = this.searchTerm().trim();

    this.productService
      .getAll({
        ...(categoryId ? { category: categoryId } : {}),
        ...(name ? { name } : {}),
      })
      .subscribe({
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
