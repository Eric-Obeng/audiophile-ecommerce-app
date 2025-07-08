import { Injectable, inject, signal, effect } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Supabase } from '../supabase/supabase';
import {
  AddToCartRequest,
  Cart,
  CartItem,
  CartResponse,
} from '../../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly authService = inject(AuthService);
  private readonly supabase = inject(Supabase);

  // Cart state signals
  cartItems = signal<CartItem[]>([]);
  isLoading = signal(false);
  cartCount = signal(0);

  constructor() {
    // Listen to auth state changes using effect
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      if (isAuth) {
        this.loadCart();
      } else {
        this.clearCart();
      }
    });
  }

  async addToCart(request: AddToCartRequest): Promise<CartResponse> {
    const user = this.authService.currentUser();

    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to add items to cart',
      };
    }

    this.isLoading.set(true);

    try {
      // Get or create cart for user
      let cart = await this.getOrCreateCart(user.id);

      if (!cart) {
        return {
          success: false,
          error: 'Failed to create cart',
        };
      }

      // Check if item already exists in cart
      const existingItem = await this.getCartItem(cart.id, request.product_id);

      console.log('Existing item:', existingItem);

      if (existingItem) {
        // Update existing item quantity using upsert
        console.log(
          `Updating quantity from ${existingItem.quantity} to ${
            existingItem.quantity + request.quantity
          }`
        );
        const { error: updateError } = await this.supabase
          .getClient()
          .from('cart_items')
          .upsert(
            {
              id: existingItem.id,
              cart_id: existingItem.cart_id,
              product_id: existingItem.product_id,
              quantity: existingItem.quantity + request.quantity,
            },
            {
              onConflict: 'id',
            }
          );

        if (updateError) {
          console.error('Update cart item error:', updateError);
          console.error('Error details:', JSON.stringify(updateError, null, 2));
          return {
            success: false,
            error: updateError.message || 'Failed to update cart item',
          };
        }
        console.log('Item quantity updated successfully');
      } else {
        // Add new item to cart
        const { error: insertError } = await this.supabase
          .getClient()
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: request.product_id,
            quantity: request.quantity,
          });

        if (insertError) {
          return {
            success: false,
            error: 'Failed to add item to cart',
          };
        }
      }

      // Reload cart to get updated items
      await this.loadCart();

      return {
        success: true,
        cart,
      };
    } catch (error) {
      console.error('Add to cart error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  private async getOrCreateCart(userId: string): Promise<Cart | null> {
    // Try to get existing cart
    const { data: existingCart, error: getError } = await this.supabase
      .getClient()
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingCart && !getError) {
      return existingCart;
    }

    // Create new cart if none exists
    const { data: newCart, error: createError } = await this.supabase
      .getClient()
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createError) {
      console.error('Error creating cart:', createError);
      return null;
    }

    return newCart;
  }

  private async getCartItem(
    cartId: number,
    productId: number
  ): Promise<CartItem | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting cart item:', error);
    }

    return data;
  }

  private async loadCart(): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      this.clearCart();
      return;
    }

    try {
      const cart = await this.getOrCreateCart(user.id);

      if (!cart) {
        this.clearCart();
        return;
      }

      // Load cart items with product details
      const { data: items, error } = await this.supabase
        .getClient()
        .from('cart_items')
        .select(
          `
          *,
          product:products (
            id,
            name,
            price,
            slug,
            images:product_images (
              id,
              product_id,
              type,
              mobile_url,
              tablet_url,
              desktop_url
            )
          )
        `
        )
        .eq('cart_id', cart.id);

      if (error) {
        console.error('Error loading cart items:', error);
        this.clearCart();
        return;
      }

      this.cartItems.set(items || []);
      this.updateCartCount();
    } catch (error) {
      console.error('Error loading cart:', error);
      this.clearCart();
    }
  }

  private clearCart(): void {
    this.cartItems.set([]);
    this.cartCount.set(0);
  }

  private updateCartCount(): void {
    const items = this.cartItems();
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCount.set(totalCount);
  }

  async removeFromCart(itemId: number): Promise<CartResponse> {
    this.isLoading.set(true);

    try {
      const { error } = await this.supabase
        .getClient()
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        return {
          success: false,
          error: 'Failed to remove item from cart',
        };
      }

      // Reload cart
      await this.loadCart();

      return {
        success: true,
      };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateCartItemQuantity(
    itemId: number,
    quantity: number
  ): Promise<CartResponse> {
    if (quantity <= 0) {
      return this.removeFromCart(itemId);
    }

    this.isLoading.set(true);

    try {
      // First get the existing item to preserve other fields
      const { data: existingItem, error: getError } = await this.supabase
        .getClient()
        .from('cart_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (getError || !existingItem) {
        return {
          success: false,
          error: 'Cart item not found',
        };
      }

      const { error } = await this.supabase
        .getClient()
        .from('cart_items')
        .upsert({
          id: existingItem.id,
          cart_id: existingItem.cart_id,
          product_id: existingItem.product_id,
          quantity,
        });

      if (error) {
        return {
          success: false,
          error: 'Failed to update cart item',
        };
      }

      // Reload cart
      await this.loadCart();

      return {
        success: true,
      };
    } catch (error) {
      console.error('Update cart item error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  async clearAllCartItems(): Promise<CartResponse> {
    const user = this.authService.currentUser();

    if (!user) {
      return {
        success: false,
        error: 'You must be logged in',
      };
    }

    this.isLoading.set(true);

    try {
      const cart = await this.getOrCreateCart(user.id);

      if (!cart) {
        return {
          success: false,
          error: 'Cart not found',
        };
      }

      const { error } = await this.supabase
        .getClient()
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      if (error) {
        return {
          success: false,
          error: 'Failed to clear cart',
        };
      }

      this.clearCart();

      return {
        success: true,
      };
    } catch (error) {
      console.error('Clear cart error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      this.isLoading.set(false);
    }
  }
}
