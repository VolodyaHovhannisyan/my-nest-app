import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async findAll(
    // skip = 0, 
    // take = 10,
    {
      pageNumber = 1,
      pageSize = 10,
      search = ""
    }
      :
      {
        pageNumber: number;
        pageSize: number;
        search?: string
      }
  ) {
    // return this.prisma.product.findMany({
    //   skip,
    //   take,
    //   orderBy: { createdAt: 'desc' },
    // });

    const where = search
      ? {
        name: {
          contains: search,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
    };

  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: number, data: Partial<CreateProductDto>) {
    await this.findOne(id); // ensures existence
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
