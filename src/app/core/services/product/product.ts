import { inject, Injectable, signal } from '@angular/core';
import { Supabase } from '../supabase/supabase';
import {
  CompleteProduct,
  Product,
  ProductGallery,
  ProductImage,
  ProductInclude,
  RelatedProduct,
} from '../../models/products.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  readonly supabaseService = inject(Supabase);

  products = signal<CompleteProduct[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  async fetchAllProducts(): Promise<CompleteProduct[]> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const { data, error } = await this.supabaseService
        .getClient()
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw new Error(error.message);

      if (!data) return [];

      const productsWithDetails = await this.addDetailsToProducts(data);
      this.products.set(productsWithDetails);
      return productsWithDetails;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch products';
      this.error.set(errorMessage);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchProductDetails(productId: number): Promise<{
    images?: ProductImage[];
    includes?: ProductInclude[];
    gallery?: ProductGallery[];
    related_products?: RelatedProduct[];
  }> {
    // Fetch images
    const { data: images } = await this.supabaseService
      .getClient()
      .from('product_images')
      .select('*')
      .eq('product_id', productId);

    // Fetch includes
    const { data: includes } = await this.supabaseService
      .getClient()
      .from('product_includes')
      .select('*')
      .eq('product_id', productId);

    // Fetch gallery
    const { data: gallery } = await this.supabaseService
      .getClient()
      .from('product_gallery')
      .select('*')
      .eq('product_id', productId);

    // Fetch related products
    const { data: relatedProducts } = await this.supabaseService
      .getClient()
      .from('related_products')
      .select('*')
      .eq('product_id', productId);

    return {
      images: images || [],
      includes: includes || [],
      gallery: gallery || [],
      related_products: relatedProducts || [],
    };
  }

  private async addDetailsToProducts(
    products: Product[]
  ): Promise<CompleteProduct[]> {
    return Promise.all(
      products.map(async (product) => {
        const details = await this.fetchProductDetails(product.id);
        const completeProduct: CompleteProduct = {
          ...product,
          images: details.images,
          includes: details.includes,
          gallery: details.gallery,
          related_products: details.related_products,
        };
        return completeProduct;
      })
    );
  }

  async fetchProductsByCategory(category: string): Promise<CompleteProduct[]> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const { data, error } = await this.supabaseService
        .getClient()
        .from('products')
        .select('*')
        .eq('category', category)
        .order('id', { ascending: true });

      if (error) throw new Error(error.message);

      if (!data) return [];

      const productsWithDetails = await this.addDetailsToProducts(data);
      return productsWithDetails;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to fetch ${category} products`;
      this.error.set(errorMessage);
      return [];
    } finally {
      this.loading.set(false);
    }
  }
}
