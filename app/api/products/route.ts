import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/products.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await getProducts(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
