import { HttpInterceptorFn } from '@angular/common/http';

export const TOKEN_KEY = 'authToken';

const WRITE_METHODS = ['POST', 'PUT', 'DELETE'];

function isAdminRoute(url: string, method: string): boolean {
  if (url.includes('/admin/')) {
    return true;
  }
  const isCategoriesOrProducts = url.includes('/categories') || url.includes('/products');
  return isCategoriesOrProducts && WRITE_METHODS.includes(method.toUpperCase());
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token || !isAdminRoute(req.url, req.method)) {
    return next(req);
  }

  const reqWithAuth = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(reqWithAuth);
};
