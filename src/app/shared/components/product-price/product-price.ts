import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-price',
  imports: [CurrencyPipe],
  templateUrl: './product-price.html',
  styleUrl: './product-price.scss',
})
export class ProductPrice {
  price = input.required<number>();
  onSale = input(false);
  discountPrice = input<number | null>(null);
  size = input<'sm' | 'lg'>('sm');
}
