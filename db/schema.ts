import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const productOverrides = sqliteTable('product_overrides', {
  id: text('id').primaryKey(),
  price: integer('price').notNull(),
  imageKey: text('image_key'),
  updatedAt: integer('updated_at').notNull(),
});
