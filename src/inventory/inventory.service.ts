import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { inventory } from '../database/schema';
import { eq, sql } from 'drizzle-orm';
import { UpdateInventoryDto, ReserveStockDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private db: DatabaseService) {}

  async getInventory(variantId: string) {
    const [inv] = await this.db.db
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, variantId));
    if (!inv) throw new NotFoundException('Inventory not found for this variant');
    return inv;
  }

  async updateStock(variantId: string, dto: UpdateInventoryDto) {
    const [inv] = await this.db.db
      .update(inventory)
      .set({ stock: dto.stock, updatedAt: new Date() })
      .where(eq(inventory.variantId, variantId))
      .returning();
    if (!inv) throw new NotFoundException('Inventory not found');
    return inv;
  }

  async reserveStock(variantId: string, dto: ReserveStockDto) {
    const [inv] = await this.db.db
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, variantId));
    if (!inv) throw new NotFoundException('Inventory not found');

    const available = inv.stock - inv.reservedStock;
    if (available < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${available}`,
      );
    }

    const [updated] = await this.db.db
      .update(inventory)
      .set({
        reservedStock: sql`${inventory.reservedStock} + ${dto.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(inventory.variantId, variantId))
      .returning();

    return updated;
  }

  async releaseStock(variantId: string, quantity: number) {
    const [inv] = await this.db.db
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, variantId));
    if (!inv) throw new NotFoundException('Inventory not found');

    const releaseQty = Math.min(quantity, inv.reservedStock);
    const [updated] = await this.db.db
      .update(inventory)
      .set({
        reservedStock: sql`${inventory.reservedStock} - ${releaseQty}`,
        updatedAt: new Date(),
      })
      .where(eq(inventory.variantId, variantId))
      .returning();

    return updated;
  }

  async fulfillStock(variantId: string, quantity: number) {
    const [inv] = await this.db.db
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, variantId));
    if (!inv) throw new NotFoundException('Inventory not found');

    if (inv.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock to fulfill. Available: ${inv.stock}`,
      );
    }
    if (inv.reservedStock < quantity) {
      throw new BadRequestException(
        `Cannot fulfill more than reserved quantity. Reserved: ${inv.reservedStock}`,
      );
    }

    const [updated] = await this.db.db
      .update(inventory)
      .set({
        stock: sql`${inventory.stock} - ${quantity}`,
        reservedStock: sql`${inventory.reservedStock} - ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(inventory.variantId, variantId))
      .returning();

    return updated;
  }

  async getAvailableStock(variantId: string): Promise<number> {
    const [inv] = await this.db.db
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, variantId));
    if (!inv) return 0;
    return inv.stock - inv.reservedStock;
  }
}
