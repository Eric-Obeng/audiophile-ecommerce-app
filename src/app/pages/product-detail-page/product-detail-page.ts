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
import { AuthService } from '../../core/services/auth/auth.service';
import { CartService } from '../../core/services/cart/cart.service';
import { CompleteProduct } from '../../core/models/products.model';
import { HotToastService } from '@ngxpert/hot-toast';

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
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(HotToastService);

  product = signal<CompleteProduct | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  quantity = signal<number>(1);
  navigatingToRelated = signal<boolean>(false);
  addingToCart = signal<boolean>(false);

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

  async addToCart() {
    const product = this.product();
    const qty = this.quantity();

    if (!product) {
      this.toastService.error('Product not found', {
        position: 'top-right',
      });
      return;
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.toastService.error('Please login to add items to cart', {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    this.addingToCart.set(true);

    try {
      const response = await this.cartService.addToCart({
        product_id: product.id,
        quantity: qty,
      });

      if (response.success) {
        this.toastService.success(`${product.name} added to cart!`, {
          duration: 3000,
          position: 'top-right',
        });
        // Reset quantity to 1 after successful add
        this.quantity.set(1);
      } else {
        this.toastService.error(response.error ?? 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.toastService.error('An unexpected error occurred');
    } finally {
      this.addingToCart.set(false);
    }
  }

  goBack() {
    const product = this.product();
    if (product?.category) {
      this.router.navigate(['/category', product.category]);
    } else {
      this.router.navigate(['/']);
    }
  }

  async navigateToRelatedProduct(relatedProductId: number) {
    try {
      this.navigatingToRelated.set(true);

      // Find the related product in the current product's related_products array
      const product = this.product();
      const relatedProduct = product?.related_products?.find(
        (rp) => rp.related_product_id === relatedProductId
      );

      if (relatedProduct?.related_product?.slug) {
        this.router.navigate(['/product', relatedProduct.related_product.slug]);
      } else {
        // Fallback to fetching product by ID if slug is not available
        const fetchedProduct = await this.productService.fetchProductById(
          relatedProductId
        );
        if (fetchedProduct) {
          this.router.navigate(['/product', fetchedProduct.slug]);
        } else {
          console.error('Related product not found');
        }
      }
    } catch (err) {
      console.error('Error navigating to related product:', err);
    } finally {
      this.navigatingToRelated.set(false);
    }
  }
}
