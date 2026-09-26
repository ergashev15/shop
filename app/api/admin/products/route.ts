import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin';
import { getProducts } from '@/lib/products.server';

const MAX_IMAGE_SIZE = 1_800_000;
const CATEGORIES = new Set([
  'ustki', 'kundalik', 'bosh', 'ichki', 'oyoq', 'pastki',
  'koylak', 'sport', 'uy', 'aksessuar', 'sumka',
]);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Ruxsat berilmadi.' }, { status: 403 });
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const category = String(form.get('category') ?? '');
  const price = Number(form.get('price'));
  const image = form.get('image');

  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: 'Mahsulot nomini to‘g‘ri kiriting.' }, { status: 400 });
  if (description.length > 140) return NextResponse.json({ error: 'Tavsif 140 belgidan oshmasligi kerak.' }, { status: 400 });
  if (!CATEGORIES.has(category)) return NextResponse.json({ error: 'Kategoriyani tanlang.' }, { status: 400 });
  if (!Number.isSafeInteger(price) || price <= 0) return NextResponse.json({ error: 'Narx noto‘g‘ri kiritildi.' }, { status: 400 });
  if (!(image instanceof File) || image.size === 0) return NextResponse.json({ error: 'Mahsulot rasmini tanlang.' }, { status: 400 });
  if (!IMAGE_TYPES.has(image.type)) return NextResponse.json({ error: 'Faqat JPG, PNG, WebP yoki AVIF rasm yuklang.' }, { status: 400 });
  if (image.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: 'Rasm juda katta. Boshqa rasm tanlang.' }, { status: 400 });

  const id = `custom-${crypto.randomUUID()}`;
  const now = Date.now();
  const imageBytes = await image.arrayBuffer();
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO custom_products (id, name, description, category, price, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, name, description, category, price, now, now),
    env.DB.prepare(`
      INSERT INTO product_images (id, bytes, content_type, updated_at)
      VALUES (?, ?, ?, ?)
    `).bind(id, imageBytes, image.type, now),
  ]);

  const product = (await getProducts()).find((item) => item.id === id);
  return NextResponse.json(product, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
