import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';

export async function isAdminRequest(): Promise<boolean> {
  if (!env.ADMIN_PASSWORD) return false;
  const cookieStore = await cookies();
  const supplied = cookieStore.get('robiya_admin')?.value;
  if (!supplied) return false;
  return safeEqual(supplied, await sessionToken(env.ADMIN_PASSWORD));
}

export async function sessionToken(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('robiya-admin-v1'));
  return base64Url(new Uint8Array(signature));
}

export async function passwordMatches(supplied: string): Promise<boolean> {
  if (!env.ADMIN_PASSWORD) return false;
  const [left, right] = await Promise.all([sessionToken(supplied), sessionToken(env.ADMIN_PASSWORD)]);
  return safeEqual(left, right);
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
