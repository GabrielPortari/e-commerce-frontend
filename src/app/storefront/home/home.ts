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
  protected readonly error = signal<string | null>(null);
  protected readonly allProducts = signal<Product[]>([]);
  protected readonly skeletonItems = Array.from({ length: 4 });

  protected readonly promotions = computed(() =>
    this.allProducts()
      .filter((product) => product.onSale)
      .slice(0, PROMOTIONS_LIMIT)
  );
  protected readonly hasPromotions = computed(() => this.promotions().length > 0);
  protected readonly newArrivals = computed(() =>
    this.sortByNewest(this.allProducts()).slice(0, NEW_ARRIVALS_LIMIT)
  );
  protected readonly featuredCategories = computed(() => this.buildFeaturedCategories(this.allProducts()));

  constructor() {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os produtos.');
        this.loading.set(false);
      },
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
