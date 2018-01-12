import {  Injectable, OnInit, EventEmitter } from "@angular/core";
import { Product } from "app/models/product";
import { AngularFireDatabase } from "angularfire2/database";
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';

import { ShoppingCart } from "app/models/shopping-cart";
import { AngularFireObject, AngularFireList } from "angularfire2/database/interfaces";
import { FirebaseObjectObservable } from "angularfire2/database-deprecated";


@Injectable()
export class UserBasketService implements OnInit{

    constructor(private db: AngularFireDatabase){} 

    ngOnInit(){}

    private create(){
        return this.db.list('/shopping-carts').push({
            dataCreated: new Date().getTime()
        });
    }

    private async getOrCreateCartId(): Promise<string>{
        let cartId = localStorage.getItem('cartId');
        if(cartId) return cartId;
        let result = await this.create();
        localStorage.setItem('cartId', result.key);
        console.log("cart id returned: ", result);
        return result.key;
    }

    async getCart():Promise<Observable<ShoppingCart>>{
        let cartId = await this.getOrCreateCartId();
        const cart: AngularFireObject<ShoppingCart> = this.db.object('/shopping-carts/' + cartId);
        const cartObservable: Observable<ShoppingCart> = cart.valueChanges();
        return cartObservable.map( (x:any) => {
            return new ShoppingCart(x.items);
        });
    }

    private getItem(cartId: string, productId: string){
        return this.db.object('/shopping-carts/' + cartId + '/items/' + productId);
    }

    async addToCart(product: Product){
       this.updateItemQuantity(product, 1);
    }

    async removeFromCart(product: Product){
        this.updateItemQuantity(product, -1);
    }

    private async updateItemQuantity(product: Product, change: number){
        let cartId = await this.getOrCreateCartId();
        
        let item$ = this.getItem(cartId, product.$key);
        
        item$.snapshotChanges()
             .take(1)
             .subscribe(item => {
                 if(item.payload.exists()){
                     item$.update({ quantity: item.payload.val().quantity + change})
                 }else{
                     item$.update({
                         product: {
                            title: product.title,
                            price: product.price,
                            category: product.category,
                            imageUrl: product.imageUrl,
                          },
                         quantity: 1
                     })
                 }
             });
    }

    // async totalQty() {
    //     let count: number;
    //     let cart$ = await this.getCart();
    //     return cart$
    //     .valueChanges()
    //     .map(cart => {
    //         // console.log("cart: ", cart)
    //         count = 0;
    //         for (let prodId in cart.items) 
    //         count += cart.items[prodId].quantity;
    //         return count;
    //     });
    // }

    // async getCartItems(){
    //     let cart$ = await this.getCart();
    //     let items;
    //     return cart$
    //         .valueChanges()
    //         .subscribe( items => {
    //             console.log("getCartItems: ", items);
    //             console.log("items array: ", Object.keys(items.items));

    //             return Object.keys(items.items);
    //         })
    // }

}