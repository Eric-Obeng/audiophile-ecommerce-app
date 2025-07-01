import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
   * Creates a minimum length validator with custom error key
   */
  static minLength(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length >= length) {
        return null;
      }
      return {
        minLength: {
          requiredLength: length,
          actualLength: control.value.length,
        },
      };
    };
  }

  /**
   * Creates a maximum length validator with custom error key
   */
  static maxLength(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length <= length) {
        return null;
      }
      return {
        maxLength: {
          requiredLength: length,
          actualLength: control.value.length,
        },
      };
    };
  }
}
