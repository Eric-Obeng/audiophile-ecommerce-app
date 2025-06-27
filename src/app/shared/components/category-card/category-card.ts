import { Component, input } from '@angular/core';

@Component({
  selector: 'app-category-card',
  imports: [],
  templateUrl: './category-card.html',
  styleUrl: './category-card.sass',
})
export class CategoryCard {
  categoryName = input.required<string>();
  categoryImage = input.required<string>();
  categoryLink = input.required<string>();
}
