import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  note: text('note').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  name: text('name').notNull(),
  /** Price in SDG (integer). NULL until the admin sets it. */
  price: integer('price'),
  /** 1 = visible, 0 = hidden */
  isAvailable: integer('is_available').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: integer('value').notNull().default(0),
});

export const phones = sqliteTable('phones', {
  id: text('id').primaryKey(),
  number: text('number').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  methodId: text('method_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  ink: text('ink').notNull(),
  number: text('number').notNull().default(''),
  holder: text('holder').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export type Category = typeof categories.$inferSelect;
export type MenuItem = typeof items.$inferSelect;
