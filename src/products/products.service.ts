import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private products: CreateProductDto[] = [];

  findAll() {
    return this.products;
  }

  create(product: CreateProductDto) {
    this.products.push(product);
    return product;
  }
}
