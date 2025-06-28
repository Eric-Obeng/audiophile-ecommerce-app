import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product/product';
import { CategoryMenu } from '../../shared/components/category-menu/category-menu';
import { Footer } from '../../shared/components/footer/footer';
import { Info } from '../../shared/components/info/info';
import { CompleteProduct } from '../../core/models/products.model';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-category-page',
  imports: [CategoryMenu, Footer, Info, LoadingSpinner, ProductCard],
  templateUrl: './category-page.html',
  styleUrl: './category-page.sass',
})
export class CategoryPage {
  route = inject(ActivatedRoute);
  productService = inject(ProductService);

  categoryName = signal<string>('');

  products = signal<CompleteProduct[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  formattedCategoryName = computed(() => {
    const name = this.categoryName();
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  });

  ngOnInit() {
    // Subscribe to route parameter changes
    this.route.paramMap.subscribe((params) => {
      const category = params.get('categoryName');
      if (category) {
        this.categoryName.set(category);
        this.fetchCategoryProducts(category);
      }
    });
  }

  async fetchCategoryProducts(category: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const products = await this.productService.fetchProductsByCategory(
        category
      );
      this.products.set(products);
    } catch (err) {
      this.error.set('Failed to load products. Please try again later.');
      console.error('Error fetching category products:', err);
    } finally {
      this.loading.set(false);
    }
  }

  getProductImage(product: CompleteProduct): string {
    const categoryImage = product.images?.find(
      (img) => img.type === 'category'
    );
    return (
      categoryImage?.desktop_url ??
      'assets/shared/desktop/image-category-thumbnail-fallback.png'
    );
  }
}
