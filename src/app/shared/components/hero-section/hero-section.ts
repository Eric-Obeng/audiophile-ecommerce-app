import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  imports: [NgOptimizedImage],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSection {

}
