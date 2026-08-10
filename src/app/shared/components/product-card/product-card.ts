import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { Badge } from '../badge/badge';
import { ProductPrice } from '../product-price/product-price';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Badge, ProductPrice],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();
}
