import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.sass',
})
export class App implements OnInit {
  protected title = 'audiophile-ecommerce-app';
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.handleSupabaseRedirect();
  }

  private handleSupabaseRedirect(): void {
    if (window.location.pathname === '/') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const urlParams = new URLSearchParams(window.location.search);

      // Check for errors first
      const error = hashParams.get('error') ?? urlParams.get('error');
      const errorCode =
        hashParams.get('error_code') ?? urlParams.get('error_code');
      const errorDescription =
        hashParams.get('error_description') ??
        urlParams.get('error_description');

      if (error) {
        let errorMessage: string;

        switch (errorCode) {
          case 'otp_expired':
            errorMessage =
              'The reset link has expired. Please request a new password reset.';
            break;
          case 'access_denied':
            errorMessage = 'Access denied. Please try again.';
            break;
          default:
            errorMessage = decodeURIComponent(errorDescription ?? error);
        }

        // Redirect to forgot password page with error message
        this.router.navigate(['/auth/forgot-password'], {
          queryParams: { error: errorMessage },
        });
        return;
      }

      // Check for recovery type in either hash or query params
      const type = hashParams.get('type') ?? urlParams.get('type');
      const accessToken =
        hashParams.get('access_token') ?? urlParams.get('access_token');
      const refreshToken =
        hashParams.get('refresh_token') ?? urlParams.get('refresh_token');

      if (type === 'recovery' && accessToken && refreshToken) {
        const resetUrl = `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=${type}`;
        this.router.navigateByUrl(resetUrl);
        return;
      }

      // Check for other auth types (like email confirmation)
      if (type === 'signup' && accessToken) {
        console.log('Email confirmation detected');
      }
    }
  }
}
