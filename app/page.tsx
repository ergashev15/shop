import Storefront from './storefront';
import { getProducts } from '@/lib/products.server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();
  return <Storefront initialProducts={products} />;
}
