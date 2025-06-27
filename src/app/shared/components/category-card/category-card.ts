import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-category-card',
  imports: [RouterModule],
  templateUrl: './category-card.html',
  styleUrl: './category-card.sass',
})
export class CategoryCard {
  categoryName = input.required<string>();
  categoryImage = input.required<string>();
  categoryLink = input.required<string>();

  get categoryRoute(): string[] {
    return ['/category', this.categoryName().toLowerCase()];
  }
}
