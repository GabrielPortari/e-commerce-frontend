import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const STORE_NAME = 'E-commerce';

export const routes: Routes = [
  {
    path: '',
    title: STORE_NAME,
    loadComponent: () => import('./storefront/home/home').then((m) => m.Home)
  },
  {
    path: 'produtos',
    title: `Produtos | ${STORE_NAME}`,
    loadComponent: () => import('./storefront/product-list/product-list').then((m) => m.ProductList)
  },
  {
    path: 'produtos/:slug',
    // Título real é definido pelo próprio componente assim que o produto carrega.
    loadComponent: () => import('./storefront/product-detail/product-detail').then((m) => m.ProductDetail)
  },
  {
    path: 'promocoes',
    title: `Promoções | ${STORE_NAME}`,
    loadComponent: () => import('./storefront/promotions/promotions').then((m) => m.Promotions)
  },
  {
    path: 'carrinho',
    title: `Carrinho | ${STORE_NAME}`,
    loadComponent: () => import('./storefront/cart/cart').then((m) => m.Cart)
  },
  {
    path: 'admin/login',
    title: `Login | Admin | ${STORE_NAME}`,
    loadComponent: () => import('./admin/login/login').then((m) => m.Login)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: `Painel | Admin | ${STORE_NAME}`,
        loadComponent: () => import('./admin/dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'produtos',
        title: `Produtos | Admin | ${STORE_NAME}`,
        loadComponent: () =>
          import('./admin/product-management/product-management').then((m) => m.ProductManagement)
      },
      {
        path: 'categorias',
        title: `Categorias | Admin | ${STORE_NAME}`,
        loadComponent: () =>
          import('./admin/category-management/category-management').then((m) => m.CategoryManagement)
      },
      {
        path: 'configuracoes',
        title: `Configurações | Admin | ${STORE_NAME}`,
        loadComponent: () => import('./admin/settings/settings').then((m) => m.SettingsPage)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
