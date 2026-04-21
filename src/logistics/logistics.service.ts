import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { orders } from '../database/schema';
import { eq } from 'drizzle-orm';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['RESERVED', 'CANCELLED'],
  RESERVED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class LogisticsService {
  constructor(private db: DatabaseService) {}

  async updateOrderStatus(orderId: string, newStatus: string) {
    const [order] = await this.db.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    if (!order) throw new NotFoundException('Order not found');

    const allowed = STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${newStatus}. Allowed: ${allowed.join(', ')}`,
      );
    }

    const [updated] = await this.db.db
      .update(orders)
      .set({ status: newStatus as any, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return updated;
  }

  async getOrderStatus(orderId: string) {
    const [order] = await this.db.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    if (!order) throw new NotFoundException('Order not found');
    return { orderId: order.id, status: order.status, updatedAt: order.updatedAt };
  }
}
