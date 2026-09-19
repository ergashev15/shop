import { getProducts } from '@/lib/products.server';
import { isAdminRequest } from '@/lib/admin';
import AdminProducts from './products';
import AdminLogin from './login';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdminRequest())) return <AdminLogin />;

  const products = await getProducts();
  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="admin-brand"><strong>Robiya shop</strong><span>Mahsulotlarni boshqarish</span></div>
        <nav className="admin-nav"><a href="/">Do‘kon</a><a href="/api/admin/logout">Chiqish</a></nav>
      </header>
      <main className="admin-main">
        <div className="admin-heading"><h1>Mahsulotlar</h1><p>Narxni yozing yoki yangi rasm tanlang. Har bir mahsulotni alohida saqlashingiz mumkin.</p></div>
        <AdminProducts initialProducts={products} />
      </main>
    </div>
  );
}
