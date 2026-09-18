import { env } from 'cloudflare:workers';
import { DEFAULT_PRODUCTS, type Product } from './products';

type OverrideRow = { id: string; price: number; image_key: string | null };

export async function getProducts(): Promise<Product[]> {
  try {
    const result = await env.DB.prepare(
      'SELECT id, price, image_key FROM product_overrides',
    ).all<OverrideRow>();
    const overrides = new Map(result.results.map((row) => [row.id, row]));
    return DEFAULT_PRODUCTS.map((product) => {
      const override = overrides.get(product.id);
      return override
        ? {
            ...product,
            price: override.price,
            imageUrl: override.image_key
              ? `/api/images/${override.image_key.split('/').map(encodeURIComponent).join('/')}`
              : null,
          }
        : product;
    });
  } catch {
    return DEFAULT_PRODUCTS;
  }
}
