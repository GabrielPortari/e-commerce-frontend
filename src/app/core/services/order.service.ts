import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order } from '../models';

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
}
