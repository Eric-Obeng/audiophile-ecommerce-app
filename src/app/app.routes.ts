import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('../app/pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('../app/pages/auth/signup/signup').then((m) => m.Signup),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('../app/pages/auth/forgot-password/forgot-password').then(
            (m) => m.ForgotPassword
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('../app/pages/auth/reset-password/reset-password').then(
            (m) => m.ResetPassword
          ),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('../app/pages/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'category/:categoryName',
    loadComponent: () =>
      import('../app/pages/category-page/category-page').then(
        (m) => m.CategoryPage
      ),
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./pages/product-detail-page/product-detail-page').then(
        (m) => m.ProductDetailPage
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
