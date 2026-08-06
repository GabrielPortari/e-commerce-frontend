import { Category } from './category.model';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: Category;
  active: boolean;
  createdAt: string;
}
