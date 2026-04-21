import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { payouts, wallets } from '../database/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class PayoutsService {
  constructor(private db: DatabaseService) {}

  async getWallet(vendorId: string) {
    const [wallet] = await this.db.db
      .select()
      .from(wallets)
      .where(eq(wallets.vendorId, vendorId));
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async creditWallet(vendorId: string, amount: number) {
    const [wallet] = await this.db.db
      .select()
      .from(wallets)
      .where(eq(wallets.vendorId, vendorId));
    if (!wallet) throw new NotFoundException('Wallet not found');

    const newBalance = (parseFloat(wallet.balance) + amount).toFixed(2);
    const [updated] = await this.db.db
      .update(wallets)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(wallets.vendorId, vendorId))
      .returning();
    return updated;
  }

  async requestPayout(vendorId: string, amount: number) {
    const [wallet] = await this.db.db
      .select()
      .from(wallets)
      .where(eq(wallets.vendorId, vendorId));
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (parseFloat(wallet.balance) < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const newBalance = (parseFloat(wallet.balance) - amount).toFixed(2);
    await this.db.db
      .update(wallets)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(wallets.vendorId, vendorId));

    const [payout] = await this.db.db
      .insert(payouts)
      .values({
        vendorId,
        amount: String(amount.toFixed(2)),
        status: 'PENDING',
      })
      .returning();

    return payout;
  }

  async getPayouts(vendorId: string) {
    return this.db.db
      .select()
      .from(payouts)
      .where(eq(payouts.vendorId, vendorId));
  }

  async updatePayoutStatus(payoutId: string, status: string) {
    const [payout] = await this.db.db
      .update(payouts)
      .set({ status })
      .where(eq(payouts.id, payoutId))
      .returning();
    if (!payout) throw new NotFoundException('Payout not found');
    return payout;
  }
}
