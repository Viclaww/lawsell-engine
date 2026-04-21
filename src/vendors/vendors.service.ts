import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { vendors, wallets } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private db: DatabaseService) {}

  async create(dto: CreateVendorDto) {
    const [vendor] = await this.db.db.insert(vendors).values(dto).returning();
    await this.db.db.insert(wallets).values({ vendorId: vendor.id, balance: '0' });
    return vendor;
  }

  async findAll() {
    return this.db.db.select().from(vendors);
  }

  async findOne(id: string) {
    const [vendor] = await this.db.db
      .select()
      .from(vendors)
      .where(eq(vendors.id, id));
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async findByUserId(userId: string) {
    const [vendor] = await this.db.db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, userId));
    return vendor;
  }
}
