export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  sessionId: string;
  items: CartItem[];
  total: number;
}
