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

export const DEFAULT_PRODUCTS: Product[] = [];

export function isKnownProduct(id: string): boolean {
  return DEFAULT_PRODUCTS.some((product) => product.id === id);
}

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('uz-UZ').format(value)} so‘m`;
}
