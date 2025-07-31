import { CommonModule } from '@angular/common';
import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-auth-input',
  imports: [CommonModule],
  templateUrl: './auth-input.html',
  styleUrl: './auth-input.sass',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuthInput),
      multi: true,
    },
  ],
})
export class AuthInput implements ControlValueAccessor {
  // Input signals
  id = input.required<string>();
  type = input<'text' | 'email' | 'password' | 'tel' | 'number' | 'radio'>('text');
  placeholder = input<string>('');
  autocomplete = input<string>('');
  hasError = input<boolean>(false);
  errorMessage = input<string>('');

  // Internal state
  value = signal<string>('');
  disabled = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  // ControlValueAccessor callbacks
  private onChange = (value: string) => {};
  onTouched = () => {};

  togglePasswordVisibility(): void {
    this.showPassword.update((current) => !current);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
