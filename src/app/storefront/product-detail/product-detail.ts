import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { SettingsService } from '../../core/services/settings.service';
import { Product } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { ProductPrice } from '../../shared/components/product-price/product-price';
import { formatCurrencyBRL } from '../../core/utils/currency';

@Component({
  selector: 'app-product-detail',
  imports: [Skeleton, ProductPrice],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  protected readonly settingsService = inject(SettingsService);

  protected readonly product = signal<Product | null>(null);
  protected readonly quantity = signal(1);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly addingToCart = signal(false);
  protected readonly activeImageIndex = signal(0);

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
    // pra mesma rota /produtos/:id com outro id, e o Angular reaproveita a
    // instância do componente — snapshot só lia o id uma vez, na criação.
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number(params.get('id'));
      this.loading.set(true);
      this.error.set(null);
      this.activeImageIndex.set(0);

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
    });
  }

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
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
