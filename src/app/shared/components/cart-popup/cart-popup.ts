import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart/cart.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-popup.html',
  styleUrl: './cart-popup.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPopupComponent {
  private readonly cartService = inject(CartService);
  cartItems = this.cartService.cartItems;
  cartCount = this.cartService.cartCount;
  toastService = inject(HotToastService);
  route = inject(Router);

  // Use input() for open state, output() for close event
  isOpen = input<boolean>(false);
  close = output<void>();

  total = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
      0
    )
  );

  // Remove open/close signal methods, use output for close
  handleClose() {
    this.close.emit();
  }

  removeAll() {
    this.cartService
      .clearAllCartItems()
      .then(() => {
        this.toastService.success('All items removed from cart', {
          duration: 3000,
        });
      })
      .catch((error) => {
        this.toastService.error('Failed to clear cart: ' + error.message, {
          duration: 3000,
        });
      })
      .finally(() => {
        this.handleClose();
      });
  }

  updateQuantity(itemId: number, quantity: number) {
    this.cartService.updateCartItemQuantity(itemId, quantity);
  }

  removeFromCart(itemId: number) {
    this.cartService
      .removeFromCart(itemId)
      .then(() => {
        this.toastService.success('Item removed from cart', { duration: 3000 });
      })
      .catch((error) => {
        this.toastService.error('Failed to remove item: ' + error.message, {
          duration: 3000,
        });
      });
  }

  checkout() {
    // Implement navigation to checkout page or modal
    this.handleClose();
    this.route.navigate(['/checkout']);
  }
}
