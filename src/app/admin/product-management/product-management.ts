import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiError, Category, Product } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Badge } from '../../shared/components/badge/badge';
import { Modal } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-product-management',
  imports: [ReactiveFormsModule, CurrencyPipe, Skeleton, EmptyState, Badge, Modal],
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss',
})
export class ProductManagement {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly uploadingImage = signal(false);
  protected readonly saving = signal(false);
  protected readonly productPendingDeactivate = signal<Product | null>(null);
  protected readonly skeletonItems = Array.from({ length: 4 });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    imageUrl: [''],
    onSale: [false],
    discountPrice: [0],
  });

  constructor() {
    this.categoryService.getAll().subscribe({ next: (categories) => this.categories.set(categories) });
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllAdmin().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Não foi possível carregar os produtos.');
        this.loading.set(false);
      },
    });
  }

  protected startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.form.setValue({
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
      categoryId: product.category.id,
      imageUrl: product.imageUrl ?? '',
      onSale: product.onSale,
      discountPrice: product.discountPrice ?? 0,
    });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.error.set(null);
    this.form.reset({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: 0,
      imageUrl: '',
      onSale: false,
      discountPrice: 0,
    });
  }

  protected onImageSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadingImage.set(true);
    this.productService.uploadImage(file).subscribe({
      next: (response) => {
        this.form.controls.imageUrl.setValue(response.imageUrl);
        this.uploadingImage.set(false);
      },
      error: () => {
        this.error.set('Falha ao enviar a imagem.');
        this.uploadingImage.set(false);
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (value.onSale && !(value.discountPrice > 0)) {
      this.error.set('Informe um preço promocional maior que zero.');
      return;
    }

    const request = {
      name: value.name,
      description: value.description,
      price: value.price,
      stock: value.stock,
      categoryId: value.categoryId,
      imageUrl: value.imageUrl || null,
      onSale: value.onSale,
      discountPrice: value.onSale ? value.discountPrice : null,
    };

    this.saving.set(true);
    this.error.set(null);

    const editingId = this.editingId();
    const request$ = editingId
      ? this.productService.update(editingId, request)
      : this.productService.create(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.loadProducts();
      },
      error: (err: { error?: ApiError }) => {
        this.error.set(err.error?.message ?? 'Erro ao salvar produto.');
        this.saving.set(false);
      },
    });
  }

  protected requestDeactivate(product: Product): void {
    this.productPendingDeactivate.set(product);
  }

  protected cancelDeactivate(): void {
    this.productPendingDeactivate.set(null);
  }

  protected confirmDeactivate(): void {
    const product = this.productPendingDeactivate();
    if (!product) {
      return;
    }

    this.productService.delete(product.id).subscribe({
      next: () => {
        this.productPendingDeactivate.set(null);
        this.loadProducts();
      },
      error: (err: { error?: ApiError }) => {
        this.productPendingDeactivate.set(null);
        this.toastService.error(err.error?.message ?? 'Erro ao desativar produto.');
      },
    });
  }
}
