import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ApiError, Category } from '../../core/models';

@Component({
  selector: 'app-category-management',
  imports: [ReactiveFormsModule],
  templateUrl: './category-management.html',
  styleUrl: './category-management.scss',
})
export class CategoryManagement {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);

  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as categorias.');
        this.loading.set(false);
      },
    });
  }

  protected create(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.categoryService.create(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.createForm.reset();
        this.loadCategories();
      },
      error: (err: { error?: ApiError }) => this.error.set(err.error?.message ?? 'Erro ao criar categoria.'),
    });
  }

  protected startEdit(category: Category): void {
    this.editingId.set(category.id);
    this.editForm.setValue({ name: category.name });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(id: number): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.categoryService.update(id, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.editingId.set(null);
        this.loadCategories();
      },
      error: (err: { error?: ApiError }) => this.error.set(err.error?.message ?? 'Erro ao editar categoria.'),
    });
  }

  protected deleteCategory(id: number): void {
    this.error.set(null);
    this.categoryService.delete(id).subscribe({
      next: () => this.loadCategories(),
      error: (err: { error?: ApiError }) =>
        this.error.set(err.error?.message ?? 'Erro ao remover categoria.'),
    });
  }
}
