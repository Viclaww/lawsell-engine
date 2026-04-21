import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { products, productVariants, inventory } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ProductsService {
  constructor(private db: DatabaseService) {}

  async create(dto: CreateProductDto) {
    const [product] = await this.db.db
      .insert(products)
      .values({
        ...dto,
        basePrice: String(dto.basePrice),
        platformCutPercent: dto.platformCutPercent
          ? String(dto.platformCutPercent)
          : '10',
      })
      .returning();
    return product;
  }

  async findAll() {
    return this.db.db.select().from(products);
  }

  async findByVendor(vendorId: string) {
    return this.db.db
      .select()
      .from(products)
      .where(eq(products.vendorId, vendorId));
  }

  async findOne(id: string) {
    const [product] = await this.db.db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const updateData: any = { ...dto };
    if (dto.basePrice !== undefined) updateData.basePrice = String(dto.basePrice);
    if (dto.platformCutPercent !== undefined)
      updateData.platformCutPercent = String(dto.platformCutPercent);
    const [product] = await this.db.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    await this.db.db.delete(products).where(eq(products.id, id));
    return { message: 'Product deleted' };
  }

  async createVariant(dto: CreateVariantDto) {
    const [variant] = await this.db.db
      .insert(productVariants)
      .values({
        ...dto,
        attributes: dto.attributes ? JSON.stringify(dto.attributes) : null,
      })
      .returning();
    await this.db.db
      .insert(inventory)
      .values({ variantId: variant.id, stock: 0, reservedStock: 0 });
    return variant;
  }

  async findVariantsByProduct(productId: string) {
    return this.db.db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));
  }

  async findVariant(id: string) {
    const [variant] = await this.db.db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, id));
    if (!variant) throw new NotFoundException('Variant not found');
    return variant;
  }
}
