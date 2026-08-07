import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models';

@Component({
  selector: 'app-order-list',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly statusFilter = signal<OrderStatus | ''>('');
  protected readonly updatingId = signal<number | null>(null);

  protected readonly statuses: OrderStatus[] = ['SIMULATED', 'CONFIRMED', 'CANCELED'];

  protected readonly filteredOrders = computed(() => {
    const filter = this.statusFilter();
    const orders = this.orders();
    return filter ? orders.filter((order) => order.status === filter) : orders;
  });

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.orderService.getAllAdmin().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os pedidos.');
        this.loading.set(false);
      },
    });
  }

  protected setStatusFilter(value: string): void {
    this.statusFilter.set(value as OrderStatus | '');
  }

  protected updateStatus(orderId: number, status: string): void {
    this.updatingId.set(orderId);
    this.orderService.updateStatus(orderId, status as OrderStatus).subscribe({
      next: (updatedOrder) => {
        this.orders.update((orders) => orders.map((o) => (o.id === orderId ? updatedOrder : o)));
        this.updatingId.set(null);
      },
      error: () => {
        this.error.set('Não foi possível atualizar o status do pedido.');
        this.updatingId.set(null);
      },
    });
  }
}
