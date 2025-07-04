import { Component } from '@angular/core';
import { CategoryMenu } from "../../shared/components/category-menu/category-menu";
import { Info } from "../../shared/components/info/info";
import { Footer } from "../../shared/components/footer/footer";

@Component({
  selector: 'app-product-detail-page',
  imports: [CategoryMenu, Info, Footer],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.sass'
})
export class ProductDetailPage {

}
