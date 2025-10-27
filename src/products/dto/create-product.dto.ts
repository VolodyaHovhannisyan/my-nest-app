import { IsString, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}
