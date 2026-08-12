import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiError, Category } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Badge } from '../../shared/components/badge/badge';
import { Modal } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-category-management',
  imports: [ReactiveFormsModule, Skeleton, EmptyState, Badge, Modal],
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
  protected readonly formModalOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly categoryPendingDelete = signal<Category | null>(null);
  protected readonly skeletonItems = Array.from({ length: 4 });

  protected readonly form = this.fb.nonNullable.group({
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

  protected openCreateForm(): void {
    this.editingId.set(null);
    this.form.reset({ name: '' });
    this.formModalOpen.set(true);
  }

  protected startEdit(category: Category): void {
    this.editingId.set(category.id);
    this.form.setValue({ name: category.name });
    this.formModalOpen.set(true);
  }

  protected closeForm(): void {
    this.formModalOpen.set(false);
    this.editingId.set(null);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const editingId = this.editingId();
    const request$ = editingId
      ? this.categoryService.update(editingId, this.form.getRawValue())
      : this.categoryService.create(this.form.getRawValue());

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadCategories();
        this.toastService.success(editingId ? 'Categoria atualizada.' : 'Categoria criada.');
      },
      error: (err: { error?: ApiError }) => {
        this.saving.set(false);
        this.toastService.error(err.error?.message ?? 'Erro ao salvar categoria.');
      },
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
