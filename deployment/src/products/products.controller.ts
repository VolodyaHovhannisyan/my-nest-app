import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (_, file, callback) => {
          const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { imageUrl: `http://${process.env.APP_URL}/uploads/${file.filename}` };
  }

  @Get()
  findAll(@Query('skip') skip?: number, @Query('take') take?: number,) {
    return this.productsService.findAll(skip, take);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
