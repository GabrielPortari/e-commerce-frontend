import { Component, inject, signal } from '@angular/core';
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

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
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
