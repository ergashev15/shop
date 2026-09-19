'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';

type Draft = { price: string; file: File | null; preview: string | null };
type NewProductDraft = { name: string; description: string; category: string; price: string; file: File | null; preview: string | null };

const categories = [
  ['ustki', 'Ustki kiyim'], ['kundalik', 'Kundalik'], ['bosh', 'Bosh kiyim'],
  ['ichki', 'Ichki kiyim'], ['oyoq', 'Oyoq kiyim'], ['pastki', 'Pastki kiyim'],
];

export default function AdminProducts({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(initialProducts.map((product) => [product.id, { price: String(product.price), file: null, preview: null }])),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, { text: string; error?: boolean }>>({});
  const [adding, setAdding] = useState(false);
  const [newStatus, setNewStatus] = useState<{ text: string; error?: boolean }>({ text: '' });
  const [newProduct, setNewProduct] = useState<NewProductDraft>({ name: '', description: '', category: 'kundalik', price: '', file: null, preview: null });

  function updatePrice(id: string, price: string) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], price } }));
  }

  async function updateFile(id: string, file: File | null) {
    let prepared = file;
    if (file && file.size > 1_500_000) {
      setMessages((current) => ({ ...current, [id]: { text: 'Rasm siqilmoqda…' } }));
      try {
        prepared = await compressImage(file);
      } catch {
        setMessages((current) => ({ ...current, [id]: { text: 'Rasmni siqib bo‘lmadi. Boshqa rasm tanlang.', error: true } }));
        return;
      }
    }
    setDrafts((current) => {
      const oldPreview = current[id].preview;
      if (oldPreview) URL.revokeObjectURL(oldPreview);
      return { ...current, [id]: { ...current[id], file: prepared, preview: prepared ? URL.createObjectURL(prepared) : null } };
    });
    setMessages((current) => ({ ...current, [id]: { text: prepared && prepared !== file ? 'Rasm yuklash uchun siqildi.' : '' } }));
  }

  async function saveProduct(product: Product) {
    const draft = drafts[product.id];
    const price = Number(draft.price);
    if (!Number.isInteger(price) || price <= 0) {
      setMessages((current) => ({ ...current, [product.id]: { text: 'Narxni to‘g‘ri kiriting.', error: true } }));
      return;
    }

    setSaving(product.id);
    setMessages((current) => ({ ...current, [product.id]: { text: 'Saqlanmoqda…' } }));
    const form = new FormData();
    form.set('price', String(price));
    if (draft.file) form.set('image', draft.file);

    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: 'PATCH', body: form });
      const data = await response.json() as Product | { error: string };
      if (!response.ok || 'error' in data) throw new Error('error' in data ? data.error : 'Saqlashda xatolik yuz berdi.');
      setProducts((current) => current.map((item) => item.id === product.id ? data : item));
      setDrafts((current) => ({ ...current, [product.id]: { price: String(data.price), file: null, preview: null } }));
      setMessages((current) => ({ ...current, [product.id]: { text: 'Saqlandi. Do‘konda ham yangilandi.' } }));
    } catch (error) {
      setMessages((current) => ({ ...current, [product.id]: { text: error instanceof Error ? error.message : 'Saqlashda xatolik yuz berdi.', error: true } }));
    } finally {
      setSaving(null);
    }
  }

  async function updateNewFile(file: File | null) {
    if (!file) {
      setNewProduct((current) => ({ ...current, file: null, preview: null }));
      return;
    }
    setNewStatus({ text: file.size > 1_500_000 ? 'Rasm siqilmoqda…' : '' });
    try {
      const prepared = file.size > 1_500_000 ? await compressImage(file) : file;
      setNewProduct((current) => {
        if (current.preview) URL.revokeObjectURL(current.preview);
        return { ...current, file: prepared, preview: URL.createObjectURL(prepared) };
      });
      setNewStatus({ text: prepared !== file ? 'Rasm yuklash uchun siqildi.' : '' });
    } catch {
      setNewStatus({ text: 'Rasmni siqib bo‘lmadi. Boshqa rasm tanlang.', error: true });
    }
  }

  async function addProduct(event: React.FormEvent) {
    event.preventDefault();
    const price = Number(newProduct.price);
    if (!newProduct.name.trim() || !Number.isInteger(price) || price <= 0 || !newProduct.file) {
      setNewStatus({ text: 'Nomi, narxi va rasmini to‘liq kiriting.', error: true });
      return;
    }
    setAdding(true);
    setNewStatus({ text: 'Mahsulot qo‘shilmoqda…' });
    const form = new FormData();
    form.set('name', newProduct.name);
    form.set('description', newProduct.description);
    form.set('category', newProduct.category);
    form.set('price', String(price));
    form.set('image', newProduct.file);

    try {
      const response = await fetch('/api/admin/products', { method: 'POST', body: form });
      const data = await response.json() as Product | { error: string };
      if (!response.ok || 'error' in data) throw new Error('error' in data ? data.error : 'Mahsulotni qo‘shib bo‘lmadi.');
      setProducts((current) => [data, ...current]);
      setDrafts((current) => ({ ...current, [data.id]: { price: String(data.price), file: null, preview: null } }));
      if (newProduct.preview) URL.revokeObjectURL(newProduct.preview);
      setNewProduct({ name: '', description: '', category: 'kundalik', price: '', file: null, preview: null });
      setNewStatus({ text: 'Mahsulot qo‘shildi va do‘konda ko‘rindi.' });
    } catch (error) {
      setNewStatus({ text: error instanceof Error ? error.message : 'Mahsulotni qo‘shib bo‘lmadi.', error: true });
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <section className="admin-create">
        <div className="admin-create-copy"><span>Yangi mahsulot</span><h2>Katalogni kengaytiring</h2><p>Mahsulot ma’lumotlarini kiriting va rasm tanlang. Saqlangach u darhol do‘konda paydo bo‘ladi.</p></div>
        <form className="admin-create-form" onSubmit={addProduct}>
          <div className="admin-create-preview" style={newProduct.preview ? { backgroundImage: `url(${newProduct.preview})` } : undefined}>{!newProduct.preview && <span>Rasm</span>}</div>
          <div className="admin-create-fields">
            <label>Mahsulot nomi<input type="text" maxLength={80} value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} placeholder="Masalan, Yozgi ko‘ylak" required /></label>
            <label>Qisqa tavsif<textarea maxLength={140} value={newProduct.description} onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))} placeholder="Mato turi · Bichimi" /></label>
            <div className="admin-create-row">
              <label>Kategoriya<select value={newProduct.category} onChange={(event) => setNewProduct((current) => ({ ...current, category: event.target.value }))}>{categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
              <label>Narxi, so‘m<input type="number" min="1" step="1000" value={newProduct.price} onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))} placeholder="250000" required /></label>
            </div>
            <label>Mahsulot rasmi<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void updateNewFile(event.target.files?.[0] ?? null)} required /></label>
            <div className={`admin-status${newStatus.error ? ' admin-error' : ''}`} aria-live="polite">{newStatus.text}</div>
            <button className="admin-save" type="submit" disabled={adding}>{adding ? 'Qo‘shilmoqda…' : 'Mahsulotni qo‘shish'}</button>
          </div>
        </form>
      </section>
      <div className="admin-list-heading"><h2>Mavjud mahsulotlar</h2><span>{products.length} ta mahsulot</span></div>
      <div className="admin-grid">
      {products.map((product) => {
        const draft = drafts[product.id];
        const imageUrl = draft.preview ?? product.imageUrl;
        const style = imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined;
        const message = messages[product.id];
        return (
          <article className="admin-card" key={product.id}>
            <div className={`product-image admin-preview ${product.imageClass}`} style={style} role="img" aria-label={product.name} />
            <div className="admin-card-content">
              <h2>{product.name}</h2>
              <label>Narxi, so‘m<input type="number" min="1" step="1000" value={draft.price} onChange={(event) => updatePrice(product.id, event.target.value)} /></label>
              <label>Yangi rasm<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void updateFile(product.id, event.target.files?.[0] ?? null)} /></label>
              <div className={`admin-status${message?.error ? ' admin-error' : ''}`} aria-live="polite">{message?.text ?? ''}</div>
              <button className="admin-save" type="button" disabled={saving === product.id} onClick={() => saveProduct(product)}>{saving === product.id ? 'Saqlanmoqda…' : 'Saqlash'}</button>
            </div>
          </article>
        );
      })}
      </div>
    </>
  );
}

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.84, 0.72, 0.6, 0.48]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (blob && blob.size <= 1_500_000) return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
  }
  throw new Error('Image is too large');
}
