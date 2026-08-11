import { Category } from './category.model';

export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  images: ProductImage[];
  category: Category;
  active: boolean;
  onSale: boolean;
  discountPrice: number | null;
  featured: boolean;
  createdAt: string;
}
