import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { AuthResponse, AuthUser, SignupData } from '../../models';
import { Supabase } from '../supabase/supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  supabase = inject(Supabase);
  router = inject(Router);

  // Auth state signals
  currentUser = signal<AuthUser | null>(null);
  isLoading = signal(false);
  isAuthenticated = signal(false);

  constructor() {
    this.supabase.getClient().auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(event, session);
    });

    this.initialize();
  }

  private initialize(): void {
    this.initializeAuth().catch((error) => {
      console.error('Failed to initialize auth:', error);
    });
  }

  private async initializeAuth(): Promise<void> {
    try {
      const {
        data: { session },
      } = await this.supabase.getClient().auth.getSession();
      if (session) {
        await this.setCurrentUser(session.user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  private async handleAuthStateChange(
    event: AuthChangeEvent,
    session: Session | null
  ): Promise<void> {
    if (event === 'SIGNED_IN' && session) {
      await this.setCurrentUser(session.user);
    } else if (event === 'SIGNED_OUT') {
      this.clearCurrentUser();
    }
  }

  private async setCurrentUser(user: User): Promise<void> {
    try {
      const { data: profile, error } = await this.supabase
        .getClient()
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email ?? '',
        fullName: user?.user_metadata['full_name'] ?? '',
        createdAt: user.created_at,
      };

      this.currentUser.set(authUser);
      this.isAuthenticated.set(true);
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  private clearCurrentUser(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    this.isLoading.set(true);

    try {
      const { data: authData, error: authError } = await this.supabase
        .getClient()
        .auth.signUp({
          email: signupData.email,
          password: signupData.password,
          options: {
            data: {
              full_name: signupData.fullName,
            },
          },
        });

      if (authError) {
        return {
          success: false,
          error: this.getReadableError(authError.message),
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to create account',
        };
      }

      const authUser: AuthUser = {
        id: authData.user.id,
        email: authData.user.email ?? '',
        fullName: signupData.fullName,
        createdAt: authData.user.created_at,
      };

      return {
        success: true,
        user: authUser,
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    this.isLoading.set(true);

    try {
      const { data, error } = await this.supabase
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        return {
          success: false,
          error: this.getReadableError(error.message),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Failed to sign in',
        };
      }

      return {
        success: true,
        user: this.currentUser() || undefined,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.supabase.getClient().auth.signOut();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async resetPassword(email: string): Promise<AuthResponse> {
    this.isLoading.set(true);

    try {
      const { error } = await this.supabase
        .getClient()
        .auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });

      if (error) {
        return {
          success: false,
          error: this.getReadableError(error.message),
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  async updatePassword(newPassword: string): Promise<AuthResponse> {
    this.isLoading.set(true);

    try {
      const { data, error } = await this.supabase.getClient().auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: this.getReadableError(error.message),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Failed to update password',
        };
      }

      // Update the current user in our state
      await this.setCurrentUser(data.user);

      return {
        success: true,
        user: this.currentUser() || undefined,
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  private getReadableError(message: string): string {
    // Convert Supabase error messages to user-friendly messages
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed':
        'Please check your email and click the confirmation link',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters':
        'Password must be at least 6 characters long',
      'Invalid email': 'Please enter a valid email address',
      'User not found':
        'If this email is registered, you will receive reset instructions',
      'Email rate limit exceeded':
        'Too many password reset requests. Please wait before trying again',
    };

    return errorMap[message] || message;
  }
}
