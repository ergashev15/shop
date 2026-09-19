'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';

const filters = [
  ['all', 'Barchasi'], ['ustki', 'Ustki kiyim'], ['kundalik', 'Kundalik'],
  ['bosh', 'Bosh kiyim'], ['ichki', 'Ichki kiyim'], ['oyoq', 'Oyoq kiyim'], ['pastki', 'Pastki kiyim'],
];

export default function Storefront({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState(0);
  const [wished, setWished] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() as Promise<Product[]> : Promise.reject())
      .then((data) => setProducts(data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 1800);
    return () => window.clearTimeout(timer);
  }, [toast, cart]);

  const visibleProducts = useMemo(() => {
    const query = search.toLocaleLowerCase('uz');
    return products.filter((product) =>
      (filter === 'all' || product.category === filter) &&
      product.name.toLocaleLowerCase('uz').includes(query),
    );
  }, [products, filter, search]);

  function addToCart() {
    setCart((value) => value + 1);
    setToast(true);
  }

  function toggleWish(id: string) {
    setWished((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="announcement">Robiya Shop · 500 000 so‘mdan yuqori buyurtmalarga bepul yetkazib berish</div>
      <header className="site-header">
        <a className="logo" href="#top" aria-label="Robiya Shop bosh sahifa"><span>Robiya</span><small>shop</small></a>
        <nav className={`desktop-nav${menuOpen ? ' open' : ''}`} aria-label="Asosiy menyu">
          <a href="#new" onClick={() => setMenuOpen(false)}>Yangi</a>
          <a href="#collection" onClick={() => setMenuOpen(false)}>Kolleksiya</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Biz haqimizda</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Aloqa</a>
        </nav>
        <div className="header-actions">
          <button className="icon-btn search-toggle" type="button" aria-label="Qidiruvni ochish" onClick={() => setSearchOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          </button>
          <button className="cart-btn" type="button" aria-label="Savatni ochish"><span>Savat</span><b className="cart-count">{cart}</b></button>
          <button className="menu-btn" type="button" aria-label="Menyuni ochish" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
        </div>
      </header>

      <div className={`search-panel${searchOpen ? ' open' : ''}`} aria-hidden={!searchOpen}>
        <label htmlFor="search">Mahsulot qidiring</label>
        <div className="search-row">
          <input id="search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Masalan, sviter" autoComplete="off" autoFocus={searchOpen} />
          <button className="search-close" type="button" onClick={() => setSearchOpen(false)}>Yopish</button>
        </div>
      </div>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <img src="/assets/robiya-background.jpg" alt="Qizil ipak fonidagi Robiya Shop belgisi" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow"><span /> Yangi kolleksiya · 2026</p>
            <h1 id="hero-title">Butun oila<br />uchun <em>uslub.</em></h1>
            <p>Ayollar, erkaklar va bolalar uchun didli, qulay kiyimlar.</p>
            <a className="primary-btn" href="#new">Xaridni boshlash <span>↗</span></a>
          </div>
          <div className="hero-note"><span>01</span><p>Robiya Shop<br />Yangi mavsum</p></div>
        </section>

        <section className="marquee" aria-label="Do‘kon afzalliklari"><div>
          <span>Yangi kolleksiya</span><i>✦</i><span>Qulay bichim</span><i>✦</i><span>Tez yetkazib berish</span><i>✦</i><span>Oson almashtirish</span><i>✦</i>
          <span>Yangi kolleksiya</span><i>✦</i><span>Qulay bichim</span><i>✦</i><span>Tez yetkazib berish</span><i>✦</i><span>Oson almashtirish</span><i>✦</i>
        </div></section>

        <section className="products-section" id="new">
          <div className="section-heading">
            <div><p className="eyebrow dark"><span /> Robiya katalogi</p><h2>Barcha bo‘limlar</h2></div>
            <div className="filters" role="group" aria-label="Mahsulot turi">
              {filters.map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
          </div>
          <div className="product-grid" id="product-grid">
            {visibleProducts.map((product) => {
              const overrideStyle = product.imageUrl ? { backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined;
              return (
                <article className="product-card" data-category={product.category} data-name={product.name} key={product.id}>
                  {product.tag && <span className={`tag${product.tagClass ? ` ${product.tagClass}` : ''}`}>{product.tag}</span>}
                  <button className={`wish${wished.has(product.id) ? ' active' : ''}`} type="button" aria-label={`${product.name}ni sevimlilarga qo‘shish`} onClick={() => toggleWish(product.id)}>{wished.has(product.id) ? '♥' : '♡'}</button>
                  <div className={`product-image ${product.imageClass}`} role="img" aria-label={product.name} style={overrideStyle} />
                  <div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>{formatPrice(product.price)}</strong></div>
                  <button className="add-btn" type="button" onClick={addToCart}>Savatga qo‘shish <span>＋</span></button>
                </article>
              );
            })}
          </div>
          {visibleProducts.length === 0 && <p className="empty-state">Hozircha mahsulotlar qo‘shilmagan.</p>}
        </section>

        <section className="collection" id="collection">
          <div className="collection-number">02</div>
          <div className="collection-copy"><p className="eyebrow"><span /> Robiya tanlovi</p><h2>Har bir kun.<br />Har bir <em>oila.</em></h2><p>Bir-biriga oson moslashadigan, uzoq xizmat qiladigan va oilaning har bir a’zosi uchun qulay liboslar.</p><a href="#new">Kolleksiyani tanlash <span>→</span></a></div>
          <div className="stat"><strong>4.9</strong><span>mijozlar bahosi</span></div>
          <div className="stat"><strong>14 kun</strong><span>ichida almashtirish</span></div>
        </section>

        <section className="about" id="about"><p>Biz kiyimni shunchaki obraz emas, <strong>o‘zingizni erkin ifodalash usuli</strong> deb bilamiz.</p></section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="contact-intro"><p className="eyebrow dark"><span /> Savolingiz bormi?</p><h2 id="contact-title">Siz bilan<br /><em>bog‘lanamiz.</em></h2><p>Mahsulot, o‘lcham yoki yetkazib berish bo‘yicha savollaringizga mamnuniyat bilan javob beramiz.</p><div className="contact-actions"><a className="primary-btn" href="tel:+998771931903">Qo‘ng‘iroq qilish <span>↗</span></a><a className="text-btn" href="https://t.me/Rob1ya_shop_uz" target="_blank" rel="noopener noreferrer">Telegram orqali yozish →</a></div></div>
          <div className="contact-details">
            <article><span>01 / Telefon</span><div className="phone-links"><a href="tel:+998771931903">+998 77 193 19 03</a><a href="tel:+998936944429">+998 93 694 44 29</a></div><p>Har kuni, 09:00–21:00</p></article>
            <article><span>02 / Manzil</span><a href="https://maps.app.goo.gl/Aa27ijGpr1aQRBTM7" target="_blank" rel="noopener noreferrer">Andijon viloyati, Xonobod shahri ↗</a><p>Manzilni Google Xaritalarda ochish</p></article>
            <article><span>03 / Ijtimoiy tarmoqlar</span><div className="social-links"><a href="https://t.me/Rob1ya_shop_uz" target="_blank" rel="noopener noreferrer">Do‘kon Telegrami ↗</a><a href="https://www.instagram.com/nod1ra_kambarova?stkn=MWt6aHBoYXo4ejZhdQ==" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div></article>
            <article><span>04 / Sotuvchi</span><a href="https://t.me/Nadira_KamBaRoVa" target="_blank" rel="noopener noreferrer">@Nadira_KamBaRoVa</a><p>Telegram orqali to‘g‘ridan-to‘g‘ri bog‘laning</p></article>
          </div>
        </section>
      </main>

      <footer><div><a className="logo" href="#top"><span>Robiya</span><small>shop</small></a><p><a href="tel:+998771931903">+998 77 193 19 03</a><br /><a href="tel:+998936944429">+998 93 694 44 29</a></p></div><div className="footer-links"><a href="#new">Do‘kon</a><a href="#about">Biz haqimizda</a><a href="#contact">Aloqa</a></div><p>© 2026 Robiya Shop</p></footer>
      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">Mahsulot savatga qo‘shildi</div>
    </>
  );
}
