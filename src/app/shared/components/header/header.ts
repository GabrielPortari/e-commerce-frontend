import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly cartService = inject(CartService);
  private readonly categoryService = inject(CategoryService);

  protected readonly categoryMenuOpen = signal(false);
  protected readonly categories = signal<Category[]>([]);

  constructor() {
    this.categoryService.getAll().subscribe({ next: (categories) => this.categories.set(categories) });
  }

  protected toggleCategoryMenu(): void {
    this.categoryMenuOpen.update((open) => !open);
  }

  protected closeCategoryMenu(): void {
    this.categoryMenuOpen.set(false);
  }
}
