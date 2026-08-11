import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { SettingsService } from '../../../core/services/settings.service';
import { WhatsappCheckoutService } from '../../../core/services/whatsapp-checkout.service';
import { Category } from '../../../core/models';

type DrawerId = 'category' | 'cart' | null;

@Component({
  selector: 'app-header',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly cartService = inject(CartService);
  protected readonly settingsService = inject(SettingsService);
  private readonly categoryService = inject(CategoryService);
  private readonly whatsappCheckoutService = inject(WhatsappCheckoutService);

  private readonly activeDrawer = signal<DrawerId>(null);
  protected readonly categoryMenuOpen = computed(() => this.activeDrawer() === 'category');
  protected readonly cartMenuOpen = computed(() => this.activeDrawer() === 'cart');
  protected readonly categories = signal<Category[]>([]);

  constructor() {
    this.categoryService.getAll().subscribe({ next: (categories) => this.categories.set(categories) });
  }

  protected toggleCategoryMenu(): void {
    this.activeDrawer.update((current) => (current === 'category' ? null : 'category'));
  }

  protected closeCategoryMenu(): void {
    this.activeDrawer.set(null);
  }

  protected toggleCartMenu(): void {
    this.activeDrawer.update((current) => (current === 'cart' ? null : 'cart'));
  }

  protected closeCartMenu(): void {
    this.activeDrawer.set(null);
  }

  protected buyOnWhatsapp(): void {
    if (this.whatsappCheckoutService.checkoutCart(this.cartService.cart())) {
      this.closeCartMenu();
    }
  }
}
