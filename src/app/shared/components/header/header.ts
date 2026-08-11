import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models';
import { buildCartWhatsappMessage } from '../../../core/utils/whatsapp-message';

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
  private readonly toastService = inject(ToastService);

  protected readonly categoryMenuOpen = signal(false);
  protected readonly cartMenuOpen = signal(false);
  protected readonly categories = signal<Category[]>([]);

  constructor() {
    this.categoryService.getAll().subscribe({ next: (categories) => this.categories.set(categories) });
  }

  protected toggleCategoryMenu(): void {
    this.categoryMenuOpen.update((open) => !open);
    this.cartMenuOpen.set(false);
  }

  protected closeCategoryMenu(): void {
    this.categoryMenuOpen.set(false);
  }

  protected toggleCartMenu(): void {
    this.cartMenuOpen.update((open) => !open);
    this.categoryMenuOpen.set(false);
  }

  protected closeCartMenu(): void {
    this.cartMenuOpen.set(false);
  }

  protected buyOnWhatsapp(): void {
    const cart = this.cartService.cart();
    if (!cart || cart.items.length === 0) {
      return;
    }

    if (this.settingsService.openWhatsapp(buildCartWhatsappMessage(cart))) {
      this.closeCartMenu();
    } else {
      this.toastService.error('Número do WhatsApp da loja ainda não foi configurado.');
    }
  }
}
