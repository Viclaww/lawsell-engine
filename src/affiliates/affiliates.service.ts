import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { affiliates, affiliateProducts, products } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CreateAffiliateProductDto } from './dto/create-affiliate-product.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';

@Injectable()
export class AffiliatesService {
  constructor(private db: DatabaseService) {}

  async createAffiliate(dto: CreateAffiliateDto) {
    const [affiliate] = await this.db.db
      .insert(affiliates)
      .values(dto)
      .returning();
    return affiliate;
  }

  async findAffiliate(id: string) {
    const [affiliate] = await this.db.db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, id));
    if (!affiliate) throw new NotFoundException('Affiliate not found');
    return affiliate;
  }

  async findAffiliateByUserId(userId: string) {
    const [affiliate] = await this.db.db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, userId));
    return affiliate;
  }

  async addProduct(dto: CreateAffiliateProductDto) {
    const [ap] = await this.db.db
      .insert(affiliateProducts)
      .values({
        ...dto,
        markupPercent: dto.markupPercent !== undefined ? String(dto.markupPercent) : '0',
      })
      .returning();
    return ap;
  }

  async findProductsByAffiliate(affiliateId: string) {
    return this.db.db
      .select()
      .from(affiliateProducts)
      .where(eq(affiliateProducts.affiliateId, affiliateId));
  }

  async findAffiliateProduct(id: string) {
    const [ap] = await this.db.db
      .select()
      .from(affiliateProducts)
      .where(eq(affiliateProducts.id, id));
    if (!ap) throw new NotFoundException('Affiliate product not found');
    return ap;
  }
}
