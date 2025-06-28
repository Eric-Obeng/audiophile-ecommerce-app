import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: '**',
    redirectTo: '',
  },
];
