import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'app/shared/category.service';
import { ProductService } from 'app/products/products.service';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {

  categories$;
  product = {};
  id;
  constructor( 
    private categoryService: CategoryService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute) {

    this.categories$ = categoryService.getCategories();
    this.id = this.route.snapshot.paramMap.get('id');

    if(this.id) this.productService
    .get(this.id)
    .valueChanges()
    .take(1)
    .subscribe( p => this.product = p)
    console.log("Product loaded: ", this.product);
   }

  ngOnInit() {
  }

  save(product){
    if(this.id) {
      this.productService.update(this.id, product);
    }else{
      this.productService.create(product);
    }
    this.router.navigate(['/admin/products']);
  }

  delete(){
    if(!confirm('Are you sure you want to delete this product?')) return;
    this.productService.delete(this.id);
    this.router.navigate(['/admin/products']);
  }
}
