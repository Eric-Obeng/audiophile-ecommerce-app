import { Component, output } from '@angular/core';

@Component({
  selector: 'app-confirm-checkout',
  imports: [],
  templateUrl: './confirm-checkout.html',
  styleUrl: './confirm-checkout.sass'
})
export class ConfirmCheckout {
  close = output<void>();

  handleClose() {
    this.close.emit();
  }
}
