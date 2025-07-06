import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  imports: [NgOptimizedImage],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  private readonly router = inject(Router);

  navigateToProduct(slug: string) {
    this.router.navigate(['/product', slug]);
  }
}
