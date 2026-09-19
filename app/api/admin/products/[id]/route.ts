import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin';
import { isKnownProduct } from '@/lib/products';
import { getProducts } from '@/lib/products.server';

const MAX_IMAGE_SIZE = 1_800_000;
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif',
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Ruxsat berilmadi.' }, { status: 403 });
  const { id } = await context.params;
  const customProduct = await env.DB.prepare('SELECT id FROM custom_products WHERE id = ?').bind(id).first<{ id: string }>();
  if (!isKnownProduct(id) && !customProduct) return NextResponse.json({ error: 'Mahsulot topilmadi.' }, { status: 404 });

  const form = await request.formData();
  const price = Number(form.get('price'));
  if (!Number.isInteger(price) || price <= 0 || price > 1_000_000_000) {
    return NextResponse.json({ error: 'Narx noto‘g‘ri kiritildi.' }, { status: 400 });
  }

  const existing = await env.DB.prepare('SELECT image_key FROM product_overrides WHERE id = ?').bind(id).first<{ image_key: string | null }>();
  let imageKey = existing?.image_key ?? null;
  const image = form.get('image');
  if (image instanceof File && image.size > 0) {
    const extension = EXTENSIONS[image.type];
    if (!extension) return NextResponse.json({ error: 'Faqat JPG, PNG, WebP yoki AVIF rasm yuklang.' }, { status: 400 });
    if (image.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: 'Rasm juda katta. Boshqa rasm tanlang.' }, { status: 400 });
    imageKey = id;
    await env.DB.prepare(`
      INSERT INTO product_images (id, bytes, content_type, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        bytes = excluded.bytes,
        content_type = excluded.content_type,
        updated_at = excluded.updated_at
    `).bind(id, new Uint8Array(await image.arrayBuffer()), image.type, Date.now()).run();
  }

  if (customProduct) {
    await env.DB.prepare('UPDATE custom_products SET price = ?, updated_at = ? WHERE id = ?')
      .bind(price, Date.now(), id).run();
  } else {
    await env.DB.prepare(`
      INSERT INTO product_overrides (id, price, image_key, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        price = excluded.price,
        image_key = excluded.image_key,
        updated_at = excluded.updated_at
    `).bind(id, price, imageKey, Date.now()).run();
  }

  const product = (await getProducts()).find((item) => item.id === id);
  return NextResponse.json(product, { headers: { 'Cache-Control': 'no-store' } });
}
