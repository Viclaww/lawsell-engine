import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles('VENDOR', 'ADMIN')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('vendor/:vendorId')
  findByVendor(@Param('vendorId') vendorId: string) {
    return this.productsService.findByVendor(vendorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles('VENDOR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('VENDOR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post('variants')
  @Roles('VENDOR', 'ADMIN')
  createVariant(@Body() dto: CreateVariantDto) {
    return this.productsService.createVariant(dto);
  }

  @Get(':id/variants')
  findVariants(@Param('id') productId: string) {
    return this.productsService.findVariantsByProduct(productId);
  }
}
