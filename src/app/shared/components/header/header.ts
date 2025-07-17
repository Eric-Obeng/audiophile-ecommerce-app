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
import { CartPopupComponent } from '../cart-popup/cart-popup';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, CartPopupComponent],
  templateUrl: './header.html',
  styleUrl: './header.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  // ...existing code...
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(HotToastService);

  isAuthenticated = this.authService.isAuthenticated;
  cartCount = this.cartService.cartCount;
  isMobileMenuOpen = signal(false);

  // Signal for cart popup visibility
  isCartPopupOpen = signal(false);

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
    this.isCartPopupOpen.set(true);
  }

  closeCartPopup(): void {
    this.isCartPopupOpen.set(false);
  }

  // Handle keyboard navigation for accessibility
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
      if (this.isCartPopupOpen()) {
        this.closeCartPopup();
      }
    }
  }

  // Dynamic aria-label for menu button accessibility
  getMenuAriaLabel(): string {
    return this.isMobileMenuOpen() ? 'Close menu' : 'Open menu';
  }
}
