import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloController } from './hello/hello.controller';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ProductsModule,PrismaModule],
  controllers: [AppController, HelloController],
  providers: [AppService],
})
export class AppModule {}
