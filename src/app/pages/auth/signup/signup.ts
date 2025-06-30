import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SignupData } from '../../../core/models';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CustomValidators, ValidationErrorMessages } from '../../../core/utils';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.sass',
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  signupForm = this.fb.group({
    fullName: [
      '',
      [Validators.required, Validators.minLength(2), CustomValidators.fullName],
    ],
    email: [
      '',
      [Validators.required, Validators.email, CustomValidators.email],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        CustomValidators.strongPassword,
      ],
    ],
  });

  // Get error message for form controls using utility
  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    return ValidationErrorMessages.getErrorMessage(control, controlName);
  }

  // Check if control has error and is touched using utility
  hasError(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return ValidationErrorMessages.hasError(control);
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword.update((current) => !current);
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = this.signupForm.value;

    // Ensure all required fields are present
    if (!formData.fullName || !formData.email || !formData.password) {
      this.errorMessage.set('All fields are required');
      this.isSubmitting.set(false);
      return;
    }

    const signupData: SignupData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await this.authService.signup(signupData);

      if (response.success) {
        this.successMessage.set(
          'Account created successfully! Please check your email for verification.'
        );
        this.signupForm.reset();

        // Redirect to login page after a brief delay
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      } else {
        this.errorMessage.set(response.error ?? 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      this.errorMessage.set('An unexpected error occurred. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
