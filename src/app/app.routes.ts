import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./storefront/product-list/product-list').then((m) => m.ProductList)
  },
  {
    path: 'produtos/:id',
    loadComponent: () => import('./storefront/product-detail/product-detail').then((m) => m.ProductDetail)
  },
  {
    path: 'carrinho',
    loadComponent: () => import('./storefront/cart/cart').then((m) => m.Cart)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./storefront/checkout/checkout').then((m) => m.Checkout)
  },
  {
    path: 'pedido/:id',
    loadComponent: () =>
      import('./storefront/order-confirmation/order-confirmation').then((m) => m.OrderConfirmation)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login/login').then((m) => m.Login)
  },
  {
    path: 'admin/produtos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/product-management/product-management').then((m) => m.ProductManagement)
  },
  {
    path: 'admin/categorias',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/category-management/category-management').then((m) => m.CategoryManagement)
  },
  {
    path: 'admin/pedidos',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/order-list/order-list').then((m) => m.OrderList)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
