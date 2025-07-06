import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompleteProduct } from '../../../core/models/products.model';

@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  product = input.required<CompleteProduct>();
  reverseLayout = input<boolean>(false);

  findCategoryImage(
    product: CompleteProduct,
    type: 'mobile' | 'tablet' | 'desktop' = 'mobile'
  ): string {
    if (!product.images || product.images.length === 0) {
      return `assets/shared/${type}/image-category-thumbnail-fallback.png`;
    }

    const categoryImage = product.images.find((img) => img.type === 'category');

    if (!categoryImage) {
      return `assets/shared/${type}/image-category-thumbnail-fallback.png`;
    }

    switch (type) {
      case 'mobile':
        return categoryImage.mobile_url;
      case 'tablet':
        return categoryImage.tablet_url;
      case 'desktop':
      default:
        return categoryImage.desktop_url;
    }
  }
}
