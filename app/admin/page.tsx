import { env } from 'cloudflare:workers';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { getProducts } from '@/lib/products.server';
import AdminProducts from './products';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await requireChatGPTUser('/admin');
  if (!env.ADMIN_USER_ID || user.userId !== env.ADMIN_USER_ID) {
    return (
      <main className="admin-denied">
        <div><h1>Ruxsat berilmadi</h1><p>Bu boshqaruv sahifasi faqat do‘kon egasi uchun.</p><a href="/">Do‘konga qaytish</a></div>
      </main>
    );
  }

  const products = await getProducts();
  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="admin-brand"><strong>Robiya shop</strong><span>Mahsulotlarni boshqarish</span></div>
        <nav className="admin-nav"><a href="/">Do‘kon</a><a href="/signout-with-chatgpt?return_to=/">Chiqish</a></nav>
      </header>
      <main className="admin-main">
        <div className="admin-heading"><h1>Mahsulotlar</h1><p>Narxni yozing yoki yangi rasm tanlang. Har bir mahsulotni alohida saqlashingiz mumkin.</p></div>
        <AdminProducts initialProducts={products} />
      </main>
    </div>
  );
}
