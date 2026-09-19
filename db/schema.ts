import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const productOverrides = sqliteTable('product_overrides', {
  id: text('id').primaryKey(),
  price: integer('price').notNull(),
  imageKey: text('image_key'),
  updatedAt: integer('updated_at').notNull(),
});

export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey(),
  bytes: blob('bytes', { mode: 'buffer' }).notNull(),
  contentType: text('content_type').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
