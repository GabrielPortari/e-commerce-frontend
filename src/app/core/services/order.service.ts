import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, OrderStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  getAllAdmin(): Observable<Order[]> {
    return this.api.get<Order[]>('/admin/orders');
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.api.put<Order>(`/admin/orders/${id}/status`, { status });
  }
}
