import { Component, output, inject, signal, computed } from '@angular/core';
import { CartService } from '../../../core/services/cart/cart.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-checkout',
  imports: [CommonModule],
  templateUrl: './confirm-checkout.html',
  styleUrl: './confirm-checkout.sass',
})
export class ConfirmCheckout {
  readonly cartService = inject(CartService);
  close = output<void>();
  route = inject(Router);

  cartItems = this.cartService.cartItems;
  showAllItems = signal(false);

  // Computed for displayed items (first item + count or all items)
  displayedItems = computed(() => {
    const items = this.cartItems();
    if (this.showAllItems() || items.length <= 1) {
      return items;
    }
    return [items[0]]; // Show only first item
  });

  remainingItemsCount = computed(() => {
    const total = this.cartItems().length;
    return total > 1 ? total - 1 : 0;
  });

  cartTotal = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
      0
    )
  );

  shipping = signal(50);
  vat = computed(() => Math.round(this.cartTotal() * 0.2));
  grandTotal = computed(() => this.cartTotal() + this.shipping() + this.vat());

  handleClose() {
    this.close.emit();
    this.route.navigate(['/']);
  }

  toggleShowAllItems() {
    this.showAllItems.set(!this.showAllItems());
  }
}
