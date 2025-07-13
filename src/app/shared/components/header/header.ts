import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CartService } from '../../../core/services/cart/cart.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(HotToastService);

  isAuthenticated = this.authService.isAuthenticated;
  cartCount = this.cartService.cartCount;
  isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onCartClick(): void {
    if (!this.isAuthenticated()) {
      this.toastService.error('Please login to view your cart', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    // Navigate to cart page or open cart modal in the future
    // For now, provide feedback that the user can access their cart
    const itemCount = this.cartCount();
    if (itemCount === 0) {
      this.toastService.info('Your cart is empty', {
        duration: 2000,
        position: 'top-right',
      });
    } else {
      this.toastService.success(
        `You have ${itemCount} item${itemCount === 1 ? '' : 's'} in your cart`,
        {
          duration: 2000,
          position: 'top-right',
        }
      );
    }
  }

  // Handle keyboard navigation for accessibility
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }
}
