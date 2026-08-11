import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from '../models';

export interface ProductFilters {
  [key: string]: string | number | boolean | undefined;
  category?: number;
  name?: string;
  onSale?: boolean;
  featured?: boolean;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: number;
  onSale: boolean;
  discountPrice: number | null;
  featured: boolean;
}

export interface ImageUploadResponse {
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  getAll(filters?: ProductFilters): Observable<Product[]> {
    return this.api.get<Product[]>('/products', filters);
  }

  getAllAdmin(): Observable<Product[]> {
    return this.api.get<Product[]>('/admin/products');
  }

  getById(id: number): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  create(product: ProductRequest): Observable<Product> {
    return this.api.post<Product>('/products', product);
  }

  update(id: number, product: ProductRequest): Observable<Product> {
    return this.api.put<Product>(`/products/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }

  reactivate(id: number): Observable<Product> {
    return this.api.put<Product>(`/products/${id}/reactivate`, null);
  }

  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<ImageUploadResponse>('/products/upload-image', formData);
  }
}
