/**
 * Authentication related interfaces and types
 */

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

export interface LoginData {
  email: string;
  password: string;
}
