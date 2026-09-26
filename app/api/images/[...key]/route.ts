import { env } from 'cloudflare:workers';

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const row = await env.DB.prepare('SELECT bytes, content_type, updated_at FROM product_images WHERE id = ?')
    .bind(key.join('/')).first<{ bytes: ArrayBuffer | Uint8Array | number[]; content_type: string; updated_at: number }>();
  if (!row) return new Response('Not found', { status: 404 });
  const bytes = Array.isArray(row.bytes) ? new Uint8Array(row.bytes) : row.bytes;
  return new Response(bytes as BodyInit, {
    headers: {
      'Content-Type': row.content_type,
      'Cache-Control': 'public, max-age=86400',
      'ETag': `"${row.updated_at}"`,
    },
  });
}
