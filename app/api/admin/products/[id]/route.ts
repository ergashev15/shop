import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin';
import { isKnownProduct } from '@/lib/products';
import { getProducts } from '@/lib/products.server';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif',
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Ruxsat berilmadi.' }, { status: 403 });
  const { id } = await context.params;
  if (!isKnownProduct(id)) return NextResponse.json({ error: 'Mahsulot topilmadi.' }, { status: 404 });

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
    if (image.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: 'Rasm hajmi 8 MB dan oshmasligi kerak.' }, { status: 400 });
    const nextKey = `products/${id}-${crypto.randomUUID()}.${extension}`;
    await env.FILES.put(nextKey, await image.arrayBuffer(), { httpMetadata: { contentType: image.type } });
    if (imageKey) await env.FILES.delete(imageKey);
    imageKey = nextKey;
  }

  await env.DB.prepare(`
    INSERT INTO product_overrides (id, price, image_key, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      price = excluded.price,
      image_key = excluded.image_key,
      updated_at = excluded.updated_at
  `).bind(id, price, imageKey, Date.now()).run();

  const product = (await getProducts()).find((item) => item.id === id);
  return NextResponse.json(product, { headers: { 'Cache-Control': 'no-store' } });
}
