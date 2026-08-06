import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models';

export interface CategoryRequest {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories');
  }

  create(category: CategoryRequest): Observable<Category> {
    return this.api.post<Category>('/categories', category);
  }

  update(id: number, category: CategoryRequest): Observable<Category> {
    return this.api.put<Category>(`/categories/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/categories/${id}`);
  }
}
