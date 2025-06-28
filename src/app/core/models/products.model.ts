export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  new: boolean;
  price: number;
  description: string;
  features: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  type: 'main' | 'category';
  mobile_url: string;
  tablet_url: string;
  desktop_url: string;
}

export interface ProductInclude {
  id: number;
  product_id: number;
  quantity: number;
  item: string;
}

export interface ProductGallery {
  id: number;
  product_id: number;
  position: 'first' | 'second' | 'third';
  mobile_url: string;
  tablet_url: string;
  desktop_url: string;
}

export interface RelatedProduct {
  id: number;
  product_id: number;
  related_product_id: number;
  image_mobile: string;
  image_tablet: string;
  image_desktop: string;
  related_product?: Product;
}

export interface CompleteProduct extends Product {
  images?: ProductImage[];
  includes?: ProductInclude[];
  gallery?: ProductGallery[];
  related_products?: RelatedProduct[];
}
