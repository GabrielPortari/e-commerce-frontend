export type OrderStatus = 'SIMULATED' | 'CONFIRMED' | 'CANCELED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
}
