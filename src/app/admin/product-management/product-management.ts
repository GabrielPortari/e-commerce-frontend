import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiError, Category, Product, ProductImage } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Badge } from '../../shared/components/badge/badge';
import { Modal } from '../../shared/components/modal/modal';

function csvEscape(value: string | number): string {
  const text = String(value);
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ';') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

interface ImportRow {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryName: string;
  onSale: boolean;
  discountPrice: number | null;
  featured: boolean;
}

function parseProductsCsv(text: string): ImportRow[] {
  const lines = text
    .split(/\r\n|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) {
    return [];
  }

  const [, ...dataLines] = lines;
  return dataLines.map((line) => {
    const [, name, description, price, stock, categoryName, , onSale, discountPrice, featured] =
      parseCsvLine(line);
    return {
      name: (name ?? '').trim(),
      description: (description ?? '').trim(),
      price: Number((price ?? '0').replace(',', '.')),
      stock: Number(stock ?? '0'),
      categoryName: (categoryName ?? '').trim(),
      onSale: (onSale ?? '').trim().toLowerCase() === 'sim',
      discountPrice: discountPrice?.trim() ? Number(discountPrice.replace(',', '.')) : null,
      featured: (featured ?? '').trim().toLowerCase() === 'sim',
    };
  });
}

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
  protected readonly editingId = signal<number | null>(null);
  protected readonly formModalOpen = signal(false);
  protected readonly uploadingImage = signal(false);
  protected readonly saving = signal(false);
  protected readonly galleryImages = signal<ProductImage[]>([]);
  protected readonly uploadingGalleryImage = signal(false);
  protected readonly productPendingDeactivate = signal<Product | null>(null);
  protected readonly importingCsv = signal(false);
  protected readonly skeletonItems = Array.from({ length: 4 });

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  protected readonly categoryFilter = signal<number | null>(null);

  protected readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const categoryId = this.categoryFilter();

    return this.products().filter((product) => {
      if (term && !product.name.toLowerCase().includes(term)) {
        return false;
      }
      if (status === 'active' && !product.active) {
        return false;
      }
      if (status === 'inactive' && product.active) {
        return false;
      }
      if (categoryId !== null && product.category.id !== categoryId) {
        return false;
      }
      return true;
    });
  });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    imageUrl: [''],
    onSale: [false],
    discountPrice: [0],
    featured: [false],
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

  protected onSearchInput(term: string): void {
    this.searchTerm.set(term);
  }

  protected onStatusFilterChange(status: string): void {
    this.statusFilter.set(status as 'all' | 'active' | 'inactive');
  }

  protected onCategoryFilterChange(categoryId: string): void {
    this.categoryFilter.set(categoryId ? Number(categoryId) : null);
  }

  protected openCreateForm(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: 0,
      imageUrl: '',
      onSale: false,
      discountPrice: 0,
      featured: false,
    });
    this.galleryImages.set([]);
    this.formModalOpen.set(true);
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
      featured: product.featured,
    });
    this.galleryImages.set(product.images);
    this.formModalOpen.set(true);
  }

  protected closeForm(): void {
    this.formModalOpen.set(false);
    this.editingId.set(null);
  }

  protected onGalleryImageSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    const productId = this.editingId();
    if (!file || !productId) {
      return;
    }

    this.uploadingGalleryImage.set(true);
    this.productService.addGalleryImage(productId, file).subscribe({
      next: (images) => {
        this.galleryImages.set(images);
        this.uploadingGalleryImage.set(false);
        input.value = '';
      },
      error: () => {
        this.toastService.error('Falha ao enviar a imagem.');
        this.uploadingGalleryImage.set(false);
      },
    });
  }

  protected removeGalleryImage(image: ProductImage): void {
    const productId = this.editingId();
    if (!productId) {
      return;
    }

    this.productService.deleteGalleryImage(productId, image.id).subscribe({
      next: (images) => this.galleryImages.set(images),
      error: () => this.toastService.error('Falha ao remover a imagem.'),
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
        this.toastService.error('Falha ao enviar a imagem.');
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
      this.toastService.error('Informe um preço promocional maior que zero.');
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
      featured: value.featured,
    };

    this.saving.set(true);

    const editingId = this.editingId();
    const request$ = editingId
      ? this.productService.update(editingId, request)
      : this.productService.create(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadProducts();
        this.toastService.success(editingId ? 'Produto atualizado.' : 'Produto criado.');
      },
      error: (err: { error?: ApiError }) => {
        this.toastService.error(err.error?.message ?? 'Erro ao salvar produto.');
        this.saving.set(false);
      },
    });
  }

  protected reactivate(product: Product): void {
    this.productService.reactivate(product.id).subscribe({
      next: () => {
        this.loadProducts();
        this.toastService.success(`"${product.name}" reativado.`);
      },
      error: (err: { error?: ApiError }) => {
        this.toastService.error(err.error?.message ?? 'Erro ao reativar produto.');
      },
    });
  }

  protected exportCsv(): void {
    const header = [
      'id',
      'nome',
      'descricao',
      'preco',
      'estoque',
      'categoria',
      'ativo',
      'emPromocao',
      'precoPromocional',
      'destaque',
    ];
    const rows = this.filteredProducts().map((product) => [
      product.id,
      product.name,
      product.description ?? '',
      product.price,
      product.stock,
      product.category.name,
      product.active ? 'sim' : 'não',
      product.onSale ? 'sim' : 'não',
      product.discountPrice ?? '',
      product.featured ? 'sim' : 'não',
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `produtos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected async importCsv(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.importingCsv.set(true);
    const rows = parseProductsCsv(await file.text());
    const categories = this.categories();
    const existingProducts = this.products();

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const row of rows) {
      if (!row.name) {
        continue;
      }
      const category = categories.find((c) => c.name.toLowerCase() === row.categoryName.toLowerCase());
      if (!category) {
        errors.push(`"${row.name}": categoria "${row.categoryName}" não encontrada`);
        continue;
      }
      if (!(row.price > 0)) {
        errors.push(`"${row.name}": preço inválido`);
        continue;
      }

      const request = {
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        categoryId: category.id,
        imageUrl: null,
        onSale: row.onSale,
        discountPrice: row.onSale ? row.discountPrice : null,
        featured: row.featured,
      };

      const existing = existingProducts.find((p) => p.name.toLowerCase() === row.name.toLowerCase());

      try {
        if (existing) {
          await firstValueFrom(this.productService.update(existing.id, request));
          updated++;
        } else {
          await firstValueFrom(this.productService.create(request));
          created++;
        }
      } catch {
        errors.push(`"${row.name}": erro ao salvar`);
      }
    }

    input.value = '';
    this.importingCsv.set(false);
    this.loadProducts();

    if (errors.length > 0) {
      this.toastService.error(
        `${created} criados, ${updated} atualizados, ${errors.length} com erro: ${errors.join('; ')}`
      );
    } else {
      this.toastService.success(`${created} produtos criados, ${updated} atualizados.`);
    }
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
