import { AbstractControl } from '@angular/forms';

/**
 * Utility class for generating form validation error messages
 */
export class ValidationErrorMessages {
  /**
   * Error message mappings for different form controls
   */
  private static readonly errorMessages: Record<
    string,
    Record<string, string>
  > = {
    fullName: {
      required: 'Full name is required',
      minLength: 'Full name must be at least 2 characters',
      invalidName: 'Full name can only contain letters and spaces',
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
      invalidEmail: 'Please enter a valid email address',
    },
    password: {
      required: 'Password is required',
      minLength: 'Password must be at least 8 characters',
      noLowercase: 'Password must contain at least one lowercase letter',
      noUppercase: 'Password must contain at least one uppercase letter',
      noNumber: 'Password must contain at least one number',
      noSpecialChar:
        'Password must contain at least one special character (@$!%*?&)',
    },
  };

  /**
   * Get error message for a specific form control
   */
  static getErrorMessage(
    control: AbstractControl | null,
    controlName: string
  ): string {
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    const controlErrors = this.errorMessages[controlName];

    if (!controlErrors) return '';

    // Return the first error message found
    for (const errorType of Object.keys(errors)) {
      if (controlErrors[errorType]) {
        return controlErrors[errorType];
      }
    }

    return '';
  }

  /**
   * Check if a form control has errors and is touched
   */
  static hasError(control: AbstractControl | null): boolean {
    return !!(control?.errors && control.touched);
  }

  /**
   * Add custom error messages for specific controls
   */
  static addErrorMessages(
    controlName: string,
    messages: Record<string, string>
  ): void {
    this.errorMessages[controlName] = {
      ...this.errorMessages[controlName],
      ...messages,
    };
  }
}
