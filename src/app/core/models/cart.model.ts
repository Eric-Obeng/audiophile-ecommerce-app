/**
 * Cart related interfaces and types
 */

export interface Cart {
  id: number;
  user_id: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    slug: string;
    images?: Array<{
      id: number;
      product_id: number;
      type: 'main' | 'category';
      mobile_url: string;
      tablet_url: string;
      desktop_url: string;
    }>;
  };
}

export interface CartResponse {
  success: boolean;
  error?: string;
  cart?: Cart;
  items?: CartItem[];
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}
