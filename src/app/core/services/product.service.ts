import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from '../models';

export interface ProductFilters {
  [key: string]: string | number | undefined;
  category?: number;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  getAll(filters?: ProductFilters): Observable<Product[]> {
    return this.api.get<Product[]>('/products', filters);
  }

  getById(id: number): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }
}
