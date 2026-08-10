import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
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
  protected readonly authService = inject(AuthService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);
  protected readonly categoryMenuOpen = signal(false);
  protected readonly categories = signal<Category[]>([]);

  constructor() {
    this.categoryService.getAll().subscribe({ next: (categories) => this.categories.set(categories) });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.categoryMenuOpen.set(false);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleCategoryMenu(): void {
    this.categoryMenuOpen.update((open) => !open);
    this.menuOpen.set(false);
  }

  protected closeCategoryMenu(): void {
    this.categoryMenuOpen.set(false);
  }

  protected logout(): void {
    this.closeMenu();
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
