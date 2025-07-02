import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SignupData } from '../../../core/models';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CustomValidators, ValidationErrorMessages } from '../../../core/utils';
import { AuthInput } from '../../../shared/components';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, AuthInput],
  templateUrl: './signup.html',
  styleUrl: './signup.sass',
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = signal(false);
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

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    return ValidationErrorMessages.getErrorMessage(control, controlName);
  }

  hasError(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return ValidationErrorMessages.hasError(control);
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
