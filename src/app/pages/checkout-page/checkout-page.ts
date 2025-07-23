import { Component, inject } from '@angular/core';
import { AuthInput } from '../../shared/components/auth-input/auth-input';
import { Footer } from '../../shared/components/footer/footer';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-page',
  imports: [AuthInput, Footer, ReactiveFormsModule, CommonModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.sass',
})
export class CheckoutPage {
  readonly fb = inject(FormBuilder);

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
      return
    }

    console.log(this.checkoutForm.value);
  }
}
