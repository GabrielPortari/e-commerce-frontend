import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, OrderStatus } from '../models';

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  create(order: CreateOrderRequest): Observable<Order> {
    return this.api.post<Order>('/orders', order);
  }

  getById(id: number): Observable<Order> {
    return this.api.get<Order>(`/orders/${id}`);
  }

  getAllAdmin(): Observable<Order[]> {
    return this.api.get<Order[]>('/admin/orders');
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.api.put<Order>(`/admin/orders/${id}/status`, { status });
  }
}
