import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Custom validators for form validation
 */
export class CustomValidators {
  /**
   * Validates email format using a comprehensive regex pattern
   */
  static email(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? null : { invalidEmail: true };
  }

  /**
   * Validates password strength requirements
   * Must contain: lowercase, uppercase, number, special character
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const errors: ValidationErrors = {};

    if (!/(?=.*[a-z])/.test(password)) {
      errors['noLowercase'] = true;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors['noUppercase'] = true;
    }
    if (!/(?=.*\d)/.test(password)) {
      errors['noNumber'] = true;
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors['noSpecialChar'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  }

  /**
   * Validates full name format (letters and spaces only)
   */
  static fullName(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (!name) return null;

    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name) ? null : { invalidName: true };
  }

  /**
   * Validates that password and confirm password fields match
   */
  static passwordsMatch(passwordField: string, confirmPasswordField: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordField);
      const confirmPassword = formGroup.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordsMismatch: true });
        return { passwordsMismatch: true };
      } else {
        // Remove the passwordsMismatch error if passwords match
        const errors = confirmPassword.errors;
        if (errors) {
          delete errors['passwordsMismatch'];
          confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
        }
        return null;
      }
    };
  }
}
