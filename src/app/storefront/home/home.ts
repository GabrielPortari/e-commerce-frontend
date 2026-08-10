import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Skeleton } from '../../shared/components/skeleton/skeleton';

const PROMOTIONS_LIMIT = 4;
const NEW_ARRIVALS_LIMIT = 8;
const FEATURED_CATEGORIES_LIMIT = 3;

interface FeaturedCategory {
  id: number;
  name: string;
  productCount: number;
  imageUrl: string | null;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, Skeleton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly productService = inject(ProductService);

  protected readonly loading = signal(true);
  protected readonly promotionsLoading = signal(true);
  protected readonly promotions = signal<Product[]>([]);
  protected readonly newArrivals = signal<Product[]>([]);
  protected readonly featuredCategories = signal<FeaturedCategory[]>([]);
  protected readonly skeletonItems = Array.from({ length: 4 });

  protected readonly hasPromotions = computed(() => this.promotions().length > 0);

  constructor() {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.newArrivals.set(this.sortByNewest(products).slice(0, NEW_ARRIVALS_LIMIT));
        this.featuredCategories.set(this.buildFeaturedCategories(products));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.productService.getAll({ onSale: true }).subscribe({
      next: (products) => {
        this.promotions.set(products.slice(0, PROMOTIONS_LIMIT));
        this.promotionsLoading.set(false);
      },
      error: () => this.promotionsLoading.set(false),
    });
  }

  private sortByNewest(products: Product[]): Product[] {
    return [...products].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private buildFeaturedCategories(products: Product[]): FeaturedCategory[] {
    const byCategory = new Map<number, FeaturedCategory>();

    for (const product of products) {
      const existing = byCategory.get(product.category.id);
      if (existing) {
        existing.productCount++;
        existing.imageUrl ??= product.imageUrl;
      } else {
        byCategory.set(product.category.id, {
          id: product.category.id,
          name: product.category.name,
          productCount: 1,
          imageUrl: product.imageUrl,
        });
      }
    }

    return [...byCategory.values()]
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, FEATURED_CATEGORIES_LIMIT);
  }
}
