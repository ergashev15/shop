import { env } from 'cloudflare:workers';
import { DEFAULT_PRODUCTS, type Product } from './products';

type OverrideRow = { id: string; price: number; image_key: string | null; updated_at: number };
type CustomRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  created_at: number;
  updated_at: number;
};

export async function getProducts(): Promise<Product[]> {
  try {
    const [overrideResult, customResult] = await Promise.all([
      env.DB.prepare('SELECT id, price, image_key, updated_at FROM product_overrides').all<OverrideRow>(),
      env.DB.prepare('SELECT id, name, description, category, price, created_at, updated_at FROM custom_products ORDER BY created_at DESC').all<CustomRow>(),
    ]);
    const overrides = new Map(overrideResult.results.map((row) => [row.id, row]));
    const defaults = DEFAULT_PRODUCTS.map((product) => {
      const override = overrides.get(product.id);
      return override
        ? {
            ...product,
            price: override.price,
            imageUrl: override.image_key
              ? `/api/images/${override.image_key.split('/').map(encodeURIComponent).join('/')}?v=${override.updated_at}`
              : null,
          }
        : product;
    });
    const custom = customResult.results.map((row): Product => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      price: row.price,
      imageClass: '',
      imageUrl: `/api/images/${encodeURIComponent(row.id)}?v=${row.updated_at}`,
      tag: 'Yangi',
    }));
    return [...custom, ...defaults];
  } catch {
    return DEFAULT_PRODUCTS;
  }
}
