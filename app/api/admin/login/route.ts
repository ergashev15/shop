import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { passwordMatches, sessionToken } from '@/lib/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: string } | null;
  if (!body?.password || !(await passwordMatches(body.password))) {
    return NextResponse.json({ error: 'Parol noto‘g‘ri.' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set('robiya_admin', await sessionToken(env.ADMIN_PASSWORD!), {
    httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
