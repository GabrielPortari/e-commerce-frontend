import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./storefront/home/home').then((m) => m.Home)
  },
  {
    path: 'produtos',
    loadComponent: () => import('./storefront/product-list/product-list').then((m) => m.ProductList)
  },
  {
    path: 'produtos/:id',
    loadComponent: () => import('./storefront/product-detail/product-detail').then((m) => m.ProductDetail)
  },
  {
    path: 'promocoes',
    loadComponent: () => import('./storefront/promotions/promotions').then((m) => m.Promotions)
  },
  {
    path: 'carrinho',
    loadComponent: () => import('./storefront/cart/cart').then((m) => m.Cart)
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
    path: 'admin/configuracoes',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/settings/settings').then((m) => m.SettingsPage)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
