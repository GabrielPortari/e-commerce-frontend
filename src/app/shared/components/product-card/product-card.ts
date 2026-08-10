import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { Badge } from '../badge/badge';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, Badge],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();
}
