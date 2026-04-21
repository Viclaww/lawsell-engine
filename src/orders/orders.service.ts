import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  orders,
  orderItems,
  productVariants,
  products,
  affiliateProducts,
} from '../database/schema';
import { eq } from 'drizzle-orm';
import { InventoryService } from '../inventory/inventory.service';
import { PricingService } from '../pricing/pricing.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private db: DatabaseService,
    private inventoryService: InventoryService,
    private pricingService: PricingService,
  ) {}

  async create(buyerId: string, dto: CreateOrderDto) {
    let markupPercent = '0';
    let platformCutPercent = '10';
    let affiliateProductId: string | null = null;

    if (dto.affiliateProductId) {
      const [ap] = await this.db.db
        .select()
        .from(affiliateProducts)
        .where(eq(affiliateProducts.id, dto.affiliateProductId));
      if (ap) {
        markupPercent = ap.markupPercent;
        affiliateProductId = ap.id;
      }
    }

    let totalAmount = 0;
    const itemsData: Array<{
      variantId: string;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const item of dto.items) {
      const [variant] = await this.db.db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, item.variantId));
      if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);

      const [product] = await this.db.db
        .select()
        .from(products)
        .where(eq(products.id, variant.productId));
      if (!product) throw new NotFoundException(`Product not found`);

      const pricing = this.pricingService.calculateFromStrings(
        product.basePrice,
        markupPercent,
        product.platformCutPercent,
      );

      await this.inventoryService.reserveStock(item.variantId, {
        quantity: item.quantity,
      });

      totalAmount += pricing.finalPrice * item.quantity;
      itemsData.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: pricing.finalPrice,
      });
    }

    const [order] = await this.db.db
      .insert(orders)
      .values({
        buyerId,
        affiliateProductId,
        totalAmount: String(totalAmount.toFixed(2)),
        status: 'RESERVED',
      })
      .returning();

    for (const item of itemsData) {
      await this.db.db.insert(orderItems).values({
        orderId: order.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice.toFixed(2)),
      });
    }

    return order;
  }

  async findAll() {
    return this.db.db.select().from(orders);
  }

  async findOne(id: string) {
    const [order] = await this.db.db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    if (!order) throw new NotFoundException('Order not found');

    const items = await this.db.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return { ...order, items };
  }

  async findByBuyer(buyerId: string) {
    return this.db.db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, buyerId));
  }

  async update(id: string, dto: UpdateOrderDto) {
    const [order] = await this.db.db
      .update(orders)
      .set({ ...(dto as any), updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async assignVendor(orderId: string, vendorId: string) {
    const [order] = await this.db.db
      .update(orders)
      .set({ vendorId, status: 'ASSIGNED', updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async fulfillOrder(orderId: string) {
    const [order] = await this.db.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    if (!order) throw new NotFoundException('Order not found');

    if (!['ASSIGNED', 'SHIPPED'].includes(order.status)) {
      throw new BadRequestException('Order must be ASSIGNED or SHIPPED to fulfill');
    }

    const items = await this.db.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      await this.inventoryService.fulfillStock(item.variantId, item.quantity);
    }

    const [fulfilled] = await this.db.db
      .update(orders)
      .set({ status: 'DELIVERED', updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return fulfilled;
  }

  async cancelOrder(orderId: string) {
    const [order] = await this.db.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === 'DELIVERED') {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    const items = await this.db.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      await this.inventoryService.releaseStock(item.variantId, item.quantity);
    }

    const [cancelled] = await this.db.db
      .update(orders)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return cancelled;
  }
}
