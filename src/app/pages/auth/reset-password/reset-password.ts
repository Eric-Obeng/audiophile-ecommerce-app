import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CustomValidators, ValidationErrorMessages } from '../../../core/utils';
import { AuthInput } from '../../../shared/components';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, AuthInput],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.sass',
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isSubmitting = signal(false);
  isValidating = signal(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isValidSession = signal(false);

  resetPasswordForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [
        CustomValidators.passwordsMatch('password', 'confirmPassword'),
      ],
    }
  );

  ngOnInit(): void {
    // Log the URL params for debugging
    const params = this.route.snapshot.queryParams;

    // Check if we have any reset parameters at all
    const hasResetParams = Boolean(
      params['access_token'] ?? params['refresh_token'] ?? params['type']
    );
    if (!hasResetParams) {
      this.errorMessage.set(
        'No reset session found. Please request a new password reset.'
      );
      this.isValidating.set(false);
      this.isValidSession.set(false);
      return;
    }

    this.validateResetSession();
  }

  private async validateResetSession(): Promise<void> {
    try {
      const params = this.route.snapshot.queryParams;
      const accessToken = params['access_token'];
      const refreshToken = params['refresh_token'];
      const type = params['type'];
      const error = params['error'];
      const errorDescription = params['error_description'];

      // Handle error cases from Supabase
      if (error) {
        console.error('Supabase reset error:', error, errorDescription);
        this.errorMessage.set(
          errorDescription ??
            'Invalid or expired reset link. Please request a new password reset.'
        );
        this.isValidating.set(false);
        this.isValidSession.set(false);
        return;
      }

      // Check if we have the required parameters for password reset
      if (!accessToken || !refreshToken || type !== 'recovery') {
        const { data: session } = await this.authService.supabase
          .getClient()
          .auth.getSession();

        if (session.session) {
          // User is already logged in, allow password reset
          this.isValidSession.set(true);
        } else {
          this.errorMessage.set(
            'Invalid or expired reset link. Please request a new password reset.'
          );
          this.isValidating.set(false);
          this.isValidSession.set(false);
        }
        return;
      }

      // Set the session with the tokens from the URL for password reset
      const { data, error: sessionError } = await this.authService.supabase
        .getClient()
        .auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (sessionError) {
        console.error('Session validation error:', sessionError);
        this.errorMessage.set(
          'Invalid or expired reset link. Please request a new password reset.'
        );
        this.isValidating.set(false);
        this.isValidSession.set(false);
        return;
      }

      // Check if the user is authenticated and this is a password recovery session
      if (data.session && data.user) {
        this.isValidSession.set(true);
        this.errorMessage.set(null);
      } else {
        this.errorMessage.set(
          'Unable to validate reset session. Please request a new password reset.'
        );
        this.isValidSession.set(false);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      this.errorMessage.set(
        'An error occurred while validating your reset link.'
      );
      this.isValidSession.set(false);
    } finally {
      this.isValidating.set(false);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.resetPasswordForm.get(controlName);
    return ValidationErrorMessages.getErrorMessage(control, controlName);
  }

  hasError(controlName: string): boolean {
    const control = this.resetPasswordForm.get(controlName);
    return ValidationErrorMessages.hasError(control);
  }

  async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = this.resetPasswordForm.value;

    if (!formData.password) {
      this.errorMessage.set('Password is required');
      this.isSubmitting.set(false);
      return;
    }

    try {
      const response = await this.authService.updatePassword(formData.password);

      if (response.success) {
        this.successMessage.set(
          'Password updated successfully! Redirecting to dashboard...'
        );
        this.resetPasswordForm.reset();

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      } else {
        this.errorMessage.set(response.error ?? 'Failed to update password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      this.errorMessage.set('An unexpected error occurred. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
