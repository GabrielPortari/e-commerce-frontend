import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiError, Category } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Modal } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-category-management',
  imports: [ReactiveFormsModule, Skeleton, EmptyState, Modal],
  templateUrl: './category-management.html',
  styleUrl: './category-management.scss',
})
export class CategoryManagement {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly editingId = signal<number | null>(null);
  protected readonly categoryPendingDelete = signal<Category | null>(null);
  protected readonly skeletonItems = Array.from({ length: 4 });

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
        this.toastService.error('Não foi possível carregar as categorias.');
        this.loading.set(false);
      },
    });
  }

  protected create(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.categoryService.create(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.createForm.reset();
        this.loadCategories();
      },
      error: (err: { error?: ApiError }) =>
        this.toastService.error(err.error?.message ?? 'Erro ao criar categoria.'),
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

    this.categoryService.update(id, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.editingId.set(null);
        this.loadCategories();
      },
      error: (err: { error?: ApiError }) =>
        this.toastService.error(err.error?.message ?? 'Erro ao editar categoria.'),
    });
  }

  protected requestDelete(category: Category): void {
    this.categoryPendingDelete.set(category);
  }

  protected cancelDelete(): void {
    this.categoryPendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const category = this.categoryPendingDelete();
    if (!category) {
      return;
    }

    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.categoryPendingDelete.set(null);
        this.loadCategories();
      },
      error: (err: { error?: ApiError }) => {
        this.categoryPendingDelete.set(null);
        this.toastService.error(err.error?.message ?? 'Erro ao remover categoria.');
      },
    });
  }
}
