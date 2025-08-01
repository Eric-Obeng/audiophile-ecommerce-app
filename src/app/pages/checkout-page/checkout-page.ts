import { Component, inject, computed, signal } from '@angular/core';
import { AuthInput } from '../../shared/components/auth-input/auth-input';
import { Footer } from '../../shared/components/footer/footer';
import { ConfirmCheckout } from '../../shared/components/confirm-checkout/confirm-checkout';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart/cart.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-checkout-page',
  imports: [
    AuthInput,
    Footer,
    ConfirmCheckout,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.sass',
})
export class CheckoutPage {
  readonly fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  toastService = inject(HotToastService);

  checkoutForm: FormGroup = this.fb.group({
    billingDetails: this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
    }),

    shippingDetails: this.fb.group({
      address: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
    }),

    paymentDetails: this.fb.group({
      method: ['e-money', Validators.required],
      eMoneyNumber: ['', [Validators.minLength(9)]],
      eMoneyPin: ['', [Validators.minLength(4)]],
    }),
  });

  cartItems = this.cartService.cartItems;
  cartTotal = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
      0
    )
  );
  shipping = signal(50); // Flat shipping for demo, adjust as needed
  vat = computed(() => this.calculateVAT(this.cartTotal()));
  grandTotal = computed(() => this.cartTotal() + this.shipping() + this.vat());

  // Modal state
  showConfirmModal = signal(false);

  calculateVAT(amount: number): number {
    return Math.round(amount * 0.2);
  }

  constructor() {
    // Dynamically set required validators for eMoney fields based on payment method
    const paymentDetails = this.checkoutForm.get('paymentDetails') as FormGroup;
    const methodControl = paymentDetails.get('method');
    const eMoneyNumberControl = paymentDetails.get('eMoneyNumber');
    const eMoneyPinControl = paymentDetails.get('eMoneyPin');

    methodControl?.valueChanges.subscribe((method: string) => {
      if (method === 'e-money') {
        eMoneyNumberControl?.addValidators([
          Validators.required,
          Validators.minLength(9),
        ]);
        eMoneyPinControl?.addValidators([
          Validators.required,
          Validators.minLength(4),
        ]);
      } else {
        eMoneyNumberControl?.removeValidators(Validators.required);
        eMoneyPinControl?.removeValidators(Validators.required);
      }
      eMoneyNumberControl?.updateValueAndValidity();
      eMoneyPinControl?.updateValueAndValidity();
    });
  }

  submitCheckoutForm() {
    console.log('submitting checkout details');
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toastService.error(`All fields are required`, {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    console.log(this.checkoutForm.value);
    // Show confirmation modal
    this.showConfirmModal.set(true);
  }

  closeConfirmModal() {
    this.showConfirmModal.set(false);
  }
}
