import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function isAdminRequest(): Promise<boolean> {
  const user = await getChatGPTUser();
  return Boolean(user && env.ADMIN_USER_ID && user.userId === env.ADMIN_USER_ID);
}
