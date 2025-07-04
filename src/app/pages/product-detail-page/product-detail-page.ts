import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { CategoryMenu } from '../../shared/components/category-menu/category-menu';
import { Info } from '../../shared/components/info/info';
import { Footer } from '../../shared/components/footer/footer';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { ProductService } from '../../core/services/product/product';
import { CompleteProduct } from '../../core/models/products.model';

@Component({
  selector: 'app-product-detail-page',
  imports: [CategoryMenu, Info, Footer, LoadingSpinner, NgOptimizedImage],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  product = signal<CompleteProduct | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  quantity = signal<number>(1);

  // Computed properties
  formattedPrice = computed(() => {
    const product = this.product();
    return product ? `$${product.price.toLocaleString()}` : '';
  });

  mainImage = computed(() => {
    const product = this.product();
    if (!product?.images) return '';

    const mainImage = product.images.find((img) => img.type === 'main');
    return mainImage?.desktop_url ?? '';
  });

  getMainImage(size: 'mobile' | 'tablet' | 'desktop'): string {
    const product = this.product();
    if (!product?.images) return '';

    const mainImage = product.images.find((img) => img.type === 'main');
    if (!mainImage) return '';

    switch (size) {
      case 'mobile':
        return mainImage.mobile_url;
      case 'tablet':
        return mainImage.tablet_url;
      case 'desktop':
      default:
        return mainImage.desktop_url;
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchProduct(slug);
      }
    });
  }

  async fetchProduct(slug: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const product = await this.productService.fetchProductBySlug(slug);

      if (!product) {
        this.error.set('Product not found');
        return;
      }

      this.product.set(product);
    } catch (err) {
      this.error.set('Failed to load product. Please try again later.');
      console.error('Error fetching product:', err);
    } finally {
      this.loading.set(false);
    }
  }

  incrementQuantity() {
    this.quantity.update((qty) => qty + 1);
  }

  decrementQuantity() {
    this.quantity.update((qty) => Math.max(1, qty - 1));
  }

  addToCart() {
    const product = this.product();
    const qty = this.quantity();

    if (product) {
      console.log(`Adding ${qty} of ${product.name} to cart`);
      // Reset quantity after adding to cart
      this.quantity.set(1);
    }
  }

  goBack() {
    window.history.back();
  }
}
