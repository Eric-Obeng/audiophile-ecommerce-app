import { Component } from '@angular/core';
import { HeroSection } from "../../shared/components/hero-section/hero-section";

@Component({
  selector: 'app-home-page',
  imports: [HeroSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.sass'
})
export class HomePage {

}
