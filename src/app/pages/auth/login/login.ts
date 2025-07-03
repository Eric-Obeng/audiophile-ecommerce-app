import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CustomValidators, ValidationErrorMessages } from '../../../core/utils';
import { AuthInput } from '../../../shared/components';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, AuthInput],
  templateUrl: './login.html',
  styleUrl: './login.sass',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, CustomValidators.email],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    return ValidationErrorMessages.getErrorMessage(control, controlName);
  }


  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return ValidationErrorMessages.hasError(control);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = this.loginForm.value;

    // Ensure all required fields are present
    if (!formData.email || !formData.password) {
      this.errorMessage.set('All fields are required');
      this.isSubmitting.set(false);
      return;
    }

    try {
      const response = await this.authService.signIn(
        formData.email,
        formData.password
      );

      if (response.success) {
        this.successMessage.set('Login successful! Redirecting...');
        this.loginForm.reset();

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      } else {
        this.errorMessage.set(response.error ?? 'Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage.set('An unexpected error occurred. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
