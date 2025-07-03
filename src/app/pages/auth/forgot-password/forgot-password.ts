import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CustomValidators, ValidationErrorMessages } from '../../../core/utils';
import { AuthInput } from '../../../shared/components';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, AuthInput],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.sass',
})
export class ForgotPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  forgotPasswordForm = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, CustomValidators.email],
    ],
  });

  ngOnInit(): void {
    // Check for error from redirect
    const error = this.route.snapshot.queryParams['error'];
    if (error) {
      this.errorMessage.set(error);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);
    return ValidationErrorMessages.getErrorMessage(control, controlName);
  }

  hasError(controlName: string): boolean {
    const control = this.forgotPasswordForm.get(controlName);
    return ValidationErrorMessages.hasError(control);
  }

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = this.forgotPasswordForm.value;

    // Ensure email is present
    if (!formData.email) {
      this.errorMessage.set('Email is required');
      this.isSubmitting.set(false);
      return;
    }

    try {
      const response = await this.authService.resetPassword(formData.email);

      if (response.success) {
        this.successMessage.set(
          'If an account with this email exists, you will receive password reset instructions shortly.'
        );
        this.forgotPasswordForm.reset();
      } else {
        this.errorMessage.set(response.error ?? 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      this.errorMessage.set('An unexpected error occurred. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
