import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { payments, orders, wallets } from '../database/schema';
import { eq } from 'drizzle-orm';
import { InitializePaymentDto } from './dto/initialize-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(private db: DatabaseService) {}

  async initialize(dto: InitializePaymentDto, userEmail: string) {
    const [order] = await this.db.db
      .select()
      .from(orders)
      .where(eq(orders.id, dto.orderId));
    if (!order) throw new NotFoundException('Order not found');

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('Cannot initialize payment for this order');
    }

    const reference = `LSE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const amountKobo = Math.round(parseFloat(order.totalAmount) * 100);

    const response = await fetch(`${this.paystackBaseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        amount: amountKobo,
        reference,
        metadata: { orderId: order.id },
      }),
    });

    const data = await response.json() as any;
    if (!data.status) {
      throw new BadRequestException(data.message || 'Payment initialization failed');
    }

    await this.db.db.insert(payments).values({
      orderId: order.id,
      reference,
      amount: order.totalAmount,
      status: 'PENDING',
    });

    return {
      authorizationUrl: data.data.authorization_url,
      reference,
      accessCode: data.data.access_code,
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<void> {
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha512', this.paystackSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    await this.handleEvent(payload);
  }

  private async handleEvent(payload: any) {
    if (payload.event === 'charge.success') {
      const reference = payload.data?.reference;
      if (!reference) return;

      const [payment] = await this.db.db
        .select()
        .from(payments)
        .where(eq(payments.reference, reference));
      if (!payment) return;

      await this.db.db
        .update(payments)
        .set({ status: 'SUCCESS' })
        .where(eq(payments.id, payment.id));

      // Credit vendor wallet
      const [order] = await this.db.db
        .select()
        .from(orders)
        .where(eq(orders.id, payment.orderId));

      if (order?.vendorId) {
        const [wallet] = await this.db.db
          .select()
          .from(wallets)
          .where(eq(wallets.vendorId, order.vendorId));

        if (wallet) {
          const newBalance = (
            parseFloat(wallet.balance) + parseFloat(payment.amount)
          ).toFixed(2);
          await this.db.db
            .update(wallets)
            .set({ balance: newBalance, updatedAt: new Date() })
            .where(eq(wallets.vendorId, order.vendorId));
        }
      }
    }
  }

  async findByOrder(orderId: string) {
    return this.db.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId));
  }

  async findByReference(reference: string) {
    const [payment] = await this.db.db
      .select()
      .from(payments)
      .where(eq(payments.reference, reference));
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
