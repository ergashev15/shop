export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageClass: string;
  imageUrl: string | null;
  tag?: string;
  tagClass?: string;
};

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'qora-overshirt', name: 'Qora overshirt', description: 'Qalin paxta · Uniseks', category: 'ustki', price: 449000, imageClass: 'p1', imageUrl: null },
  { id: 'krem-sviter', name: 'Krem sviter', description: 'Yumshoq trikotaj', category: 'kundalik', price: 329000, imageClass: 'p2', imageUrl: null, tag: 'Yangi' },
  { id: 'kok-hudi', name: 'Ko‘k hudi', description: 'Og‘ir futer · Oversize', category: 'kundalik', price: 389000, imageClass: 'p3', imageUrl: null, tag: 'Top', tagClass: 'blue' },
  { id: 'keng-shim', name: 'Keng shim', description: 'Erkin bichim · Uniseks', category: 'kundalik', price: 359000, imageClass: 'p4', imageUrl: null },
  { id: 'bordo-shapka', name: 'Bordo shapkasi', description: 'Yumshoq trikotaj · Uniseks', category: 'bosh', price: 149000, imageClass: 'category-image c1', imageUrl: null, tag: 'Yangi' },
  { id: 'oq-futbolka', name: 'Oq ichki futbolka', description: '100% paxta · Nafas oluvchi', category: 'ichki', price: 119000, imageClass: 'category-image c2', imageUrl: null },
  { id: 'bordo-krossovka', name: 'Bordo krossovka', description: 'Yengil taglik · Kundalik', category: 'oyoq', price: 499000, imageClass: 'category-image c3', imageUrl: null, tag: 'Top', tagClass: 'blue' },
  { id: 'klassik-keng-shim', name: 'Klassik keng shim', description: 'Yumshoq mato · Erkin bichim', category: 'pastki', price: 379000, imageClass: 'category-image c4', imageUrl: null },
];

export function isKnownProduct(id: string): boolean {
  return DEFAULT_PRODUCTS.some((product) => product.id === id);
}

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('uz-UZ').format(value)} so‘m`;
}
