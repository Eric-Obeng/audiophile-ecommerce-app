import { inject, Injectable } from '@angular/core';
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

  async fetchAllProducts(): Promise<CompleteProduct[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw new Error(error.message);
    if (!data) return [];

    const productsWithDetails = await this.addDetailsToProducts(data);
    return productsWithDetails;
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

    // Fetch related products with product details
    const { data: relatedProducts } = await this.supabaseService
      .getClient()
      .from('related_products')
      .select(
        `
        *,
        related_product:products!related_product_id(slug, name)
      `
      )
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
  }

  async fetchProductBySlug(slug: string): Promise<CompleteProduct | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Product not found
        return null;
      }
      throw new Error(error.message);
    }

    if (!data) return null;

    const details = await this.fetchProductDetails(data.id);
    const completeProduct: CompleteProduct = {
      ...data,
      images: details.images,
      includes: details.includes,
      gallery: details.gallery,
      related_products: details.related_products,
    };

    return completeProduct;
  }

  async fetchProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Product not found
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  }
}
