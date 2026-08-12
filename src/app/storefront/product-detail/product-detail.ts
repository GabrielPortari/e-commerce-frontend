import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { SettingsService } from '../../core/services/settings.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Review } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { ProductPrice } from '../../shared/components/product-price/product-price';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Carousel } from '../../shared/components/carousel/carousel';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { formatCurrencyBRL } from '../../core/utils/currency';

const LOW_STOCK_THRESHOLD = 5;
const RELATED_PRODUCTS_LIMIT = 8;

@Component({
  selector: 'app-product-detail',
  imports: [ReactiveFormsModule, Skeleton, ProductPrice, ProductCard, Carousel, Breadcrumbs],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly reviewService = inject(ReviewService);
  protected readonly settingsService = inject(SettingsService);
  protected readonly authService = inject(AuthService);

  protected readonly product = signal<Product | null>(null);
  protected readonly quantity = signal(1);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly addingToCart = signal(false);
  protected readonly activeImageIndex = signal(0);
  protected readonly relatedProducts = signal<Product[]>([]);
  protected readonly reviews = signal<Review[]>([]);
  protected readonly submittingReview = signal(false);

  protected readonly reviewForm = this.fb.nonNullable.group({
    authorName: ['', Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
  });

  protected readonly isLowStock = computed(() => {
    const product = this.product();
    return !!product && product.active && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  });

  // Foto de capa (imageUrl) + galeria extra (images) viram uma lista só pro
  // carrossel — do ponto de vista do visitante não existe distinção entre
  // "capa" e "extra", é tudo foto do produto.
  protected readonly galleryImages = computed(() => {
    const product = this.product();
    if (!product) {
      return [];
    }
    const cover = product.imageUrl ? [product.imageUrl] : [];
    return [...cover, ...product.images.map((image) => image.imageUrl)];
  });

  constructor() {
    // route.paramMap (não snapshot): links de "produtos relacionados" apontam
    // pra mesma rota /produtos/:slug com outro slug, e o Angular reaproveita a
    // instância do componente — snapshot só lia o param uma vez, na criação.
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.loading.set(true);
      this.error.set(null);
      this.activeImageIndex.set(0);
      this.quantity.set(1);
      this.relatedProducts.set([]);
      this.reviews.set([]);
      this.reviewForm.reset({ authorName: '', rating: 5, comment: '' });

      this.productService.getBySlug(slug).subscribe({
        next: (product) => {
          this.product.set(product);
          this.loading.set(false);
          this.titleService.setTitle(`${product.name} | E-commerce`);
          this.loadRelatedProducts(product);
          this.loadReviews(product.id);
        },
        error: () => {
          this.error.set('Produto não encontrado.');
          this.loading.set(false);
          this.titleService.setTitle('Produto não encontrado | E-commerce');
        },
      });
    });
  }

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected shareProduct(): void {
    const product = this.product();
    if (!product) {
      return;
    }

    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, url }).catch(() => {});
      return;
    }

    navigator.clipboard
      .writeText(url)
      .then(() => this.toastService.success('Link copiado para a área de transferência.'))
      .catch(() => this.toastService.error('Não foi possível copiar o link.'));
  }

  protected submitReview(): void {
    const product = this.product();
    if (!product || this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.submittingReview.set(true);
    this.reviewService.create(product.id, this.reviewForm.getRawValue()).subscribe({
      next: (review) => {
        this.reviews.update((reviews) => [review, ...reviews]);
        this.reviewForm.reset({ authorName: '', rating: 5, comment: '' });
        this.submittingReview.set(false);
        this.toastService.success('Avaliação enviada. Obrigado!');
      },
      error: () => {
        this.submittingReview.set(false);
        this.toastService.error('Não foi possível enviar a avaliação.');
      },
    });
  }

  protected deleteReview(review: Review): void {
    this.reviewService.delete(review.id).subscribe({
      next: () => this.reviews.update((reviews) => reviews.filter((r) => r.id !== review.id)),
      error: () => this.toastService.error('Não foi possível remover a avaliação.'),
    });
  }

  private loadReviews(productId: number): void {
    this.reviewService.getByProduct(productId).subscribe({
      next: (reviews) => this.reviews.set(reviews),
    });
  }

  private loadRelatedProducts(product: Product): void {
    this.productService.getAll({ category: product.category.id }).subscribe({
      next: (products) => {
        this.relatedProducts.set(
          products.filter((related) => related.id !== product.id).slice(0, RELATED_PRODUCTS_LIMIT)
        );
      },
    });
  }

  protected setQuantity(value: string): void {
    const parsed = Number(value);
    const stock = this.product()?.stock ?? Infinity;
    if (parsed >= 1) {
      this.quantity.set(Math.min(parsed, stock));
    }
  }

  protected addToCart(): void {
    const product = this.product();
    if (!product) {
      return;
    }

    this.addingToCart.set(true);
    this.cartService.addItem(product.id, this.quantity()).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.toastService.success('Produto adicionado ao carrinho.');
      },
      error: () => {
        this.addingToCart.set(false);
        this.toastService.error('Não foi possível adicionar o produto ao carrinho.');
      },
    });
  }

  protected buyOnWhatsapp(): void {
    const product = this.product();
    if (!product) {
      return;
    }

    const unitPrice = product.onSale && product.discountPrice !== null ? product.discountPrice : product.price;
    const quantity = this.quantity();
    const message = [
      'Olá! Tenho interesse neste produto:',
      '',
      `${product.name} (x${quantity})`,
      `Preço unitário: ${formatCurrencyBRL(unitPrice)}`,
      `Total: ${formatCurrencyBRL(unitPrice * quantity)}`,
    ].join('\n');

    if (!this.settingsService.openWhatsapp(message)) {
      this.toastService.error('Número do WhatsApp da loja ainda não foi configurado.');
    }
  }
}
