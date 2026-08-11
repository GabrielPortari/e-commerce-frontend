import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
import { Carousel } from '../../shared/components/carousel/carousel';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Skeleton } from '../../shared/components/skeleton/skeleton';

const PROMOTIONS_LIMIT = 4;
const NEW_ARRIVALS_LIMIT = 8;
const FEATURED_CATEGORIES_LIMIT = 3;
const HERO_AUTOPLAY_MS = 6000;

interface FeaturedCategory {
  id: number;
  name: string;
  productCount: number;
  imageUrl: string | null;
}

interface HeroSlide {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  ctaLink: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, Carousel, ProductCard, Skeleton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly allProducts = signal<Product[]>([]);
  protected readonly skeletonItems = Array.from({ length: 4 });

  protected readonly heroSlides: HeroSlide[] = [
    {
      eyebrow: 'Sobre nós',
      title: 'Roupas pensadas para o seu dia a dia',
      text: 'Selecionamos peças com qualidade e bom caimento, direto para a sua casa. Um catálogo enxuto, sem enrolação, com atendimento próximo do início ao fim da compra.',
      cta: 'Ver produtos',
      ctaLink: '/produtos',
    },
    {
      eyebrow: 'Novidades',
      title: 'Peças novas chegando toda semana',
      text: 'Fique de olho nos lançamentos mais recentes do catálogo, escolhidos a dedo pra renovar seu guarda-roupa sem exagero.',
      cta: 'Ver novidades',
      ctaLink: '/produtos',
    },
    {
      eyebrow: 'Promoções',
      title: 'Ofertas selecionadas por tempo limitado',
      text: 'Descontos reais em peças escolhidas, sem letra miúda. Confira o que está em promoção agora.',
      cta: 'Ver promoções',
      ctaLink: '/promocoes',
    },
  ];
  protected readonly activeSlide = signal(0);

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

    const autoplay = setInterval(() => this.nextSlide(), HERO_AUTOPLAY_MS);
    this.destroyRef.onDestroy(() => clearInterval(autoplay));
  }

  protected nextSlide(): void {
    this.activeSlide.update((index) => (index + 1) % this.heroSlides.length);
  }

  protected prevSlide(): void {
    this.activeSlide.update(
      (index) => (index - 1 + this.heroSlides.length) % this.heroSlides.length
    );
  }

  protected goToSlide(index: number): void {
    this.activeSlide.set(index);
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
