import { Component } from '@angular/core';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { CategoryMenu } from '../../shared/components/category-menu/category-menu';
import { ScrollAnimationDirective } from '../../shared/directives/scroll-animation.directive';
import { Footer } from "../../shared/components/footer/footer";
import { Info } from "../../shared/components/info/info";

@Component({
  selector: 'app-home-page',
  imports: [HeroSection, CategoryMenu, ScrollAnimationDirective, Footer, Info],
  templateUrl: './home-page.html',
  styleUrl: './home-page.sass',
})
export class HomePage {}
