import { pgTable, uuid, text, integer, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'VENDOR', 'AFFILIATE']);
export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'RESERVED',
  'ASSIGNED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'SUCCESS', 'FAILED']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull().default('VENDOR'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  businessName: text('business_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const affiliates = pgTable('affiliates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id')
    .notNull()
    .references(() => vendors.id),
  name: text('name').notNull(),
  description: text('description'),
  basePrice: numeric('base_price', { precision: 12, scale: 2 }).notNull(),
  platformCutPercent: numeric('platform_cut_percent', { precision: 5, scale: 2 })
    .notNull()
    .default('10'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  sku: text('sku').notNull().unique(),
  attributes: text('attributes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id)
    .unique(),
  stock: integer('stock').notNull().default(0),
  reservedStock: integer('reserved_stock').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const affiliateProducts = pgTable('affiliate_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  affiliateId: uuid('affiliate_id')
    .notNull()
    .references(() => affiliates.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  markupPercent: numeric('markup_percent', { precision: 5, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  affiliateProductId: uuid('affiliate_product_id').references(() => affiliateProducts.id),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  reference: text('reference').notNull().unique(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id')
    .notNull()
    .references(() => vendors.id)
    .unique(),
  balance: numeric('balance', { precision: 12, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id')
    .notNull()
    .references(() => vendors.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
});
