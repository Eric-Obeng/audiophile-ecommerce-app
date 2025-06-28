import { Component } from '@angular/core';
import { CategoryCard } from '../category-card/category-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-menu',
  imports: [CategoryCard, CommonModule],
  templateUrl: './category-menu.html',
  styleUrl: './category-menu.sass',
})
export class CategoryMenu {
  categories = [
    {
      name: 'HEADPHONES',
      imageUrl: 'assets/shared/desktop/image-category-thumbnail-headphones.png',
      link: '/category/headphones',
    },
    {
      name: 'SPEAKERS',
      imageUrl: 'assets/shared/desktop/image-category-thumbnail-speakers.png',
      link: '/category/speakers',
    },
    {
      name: 'EARPHONES',
      imageUrl: 'assets/shared/desktop/image-category-thumbnail-earphones.png',
      link: '/category/earphones',
    },
  ];
}
