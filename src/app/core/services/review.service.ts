import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Review, ReviewPage } from '../models';

export interface ReviewRequest {
  authorName: string;
  rating: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = inject(ApiService);

  getByProduct(
    productId: number,
    params?: { page?: number; size?: number; sort?: 'recent' | 'highest' | 'lowest' }
  ): Observable<ReviewPage> {
    return this.api.get<ReviewPage>(`/products/${productId}/reviews`, params);
  }

  create(productId: number, request: ReviewRequest): Observable<Review> {
    return this.api.post<Review>(`/products/${productId}/reviews`, request);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/reviews/${id}`);
  }
}
