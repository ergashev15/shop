'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Heart, Menu, Search, X } from 'lucide-react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';

const mainCategories = [
  ['all', 'Barchasi'],
  ['women', 'Ayollar'],
  ['men', 'Erkaklar'],
  ['children', 'Bolalar'],
  ['accessories', 'Aksessuarlar'],
] as const;

const subcategories = {
  women: [
    ['koylak', 'Ko‘ylaklar'], ['ustki', 'Ustki kiyim'], ['kundalik', 'Kundalik kiyim'],
    ['pastki', 'Shim va yubkalar'], ['ichki', 'Ichki kiyim'], ['sport', 'Sport kiyim'],
    ['uy', 'Uy kiyimi'], ['oyoq', 'Oyoq kiyim'],
  ],
  men: [
    ['ustki', 'Ustki kiyim'], ['kundalik', 'Kundalik kiyim'], ['pastki', 'Shimlar'],
    ['ichki', 'Ichki kiyim'], ['sport', 'Sport kiyim'], ['uy', 'Uy kiyimi'],
    ['oyoq', 'Oyoq kiyim'], ['bosh', 'Bosh kiyim'],
  ],
  children: [
    ['ustki', 'Ustki kiyim'], ['kundalik', 'Kundalik kiyim'], ['koylak', 'Ko‘ylaklar'],
    ['pastki', 'Shim va yubkalar'], ['sport', 'Sport kiyim'], ['uy', 'Uy kiyimi'],
    ['oyoq', 'Oyoq kiyim'], ['bosh', 'Bosh kiyim'],
  ],
} as const;

type MainCategory = typeof mainCategories[number][0];
type ExpandableCategory = keyof typeof subcategories;
const FAVORITES_STORAGE_KEY = 'robiya-shop-favorites';
const SELLER_TELEGRAM = 'Nadira_KamBaRoVa';
const STORE_ORIGIN = 'https://robiya-shop.robiya.workers.dev';

function getTelegramOrderUrl(product: Product) {
  const imageUrl = product.imageUrl ? new URL(product.imageUrl, STORE_ORIGIN).toString() : null;
  const message = [
    `Assalomu alaykum! “${product.name}” mahsulotini (${formatPrice(product.price)}) sotib olmoqchiman.`,
    imageUrl ? `Mahsulot rasmi: ${imageUrl}` : null,
  ].filter(Boolean).join('\n');
  return `https://t.me/${SELLER_TELEGRAM}?text=${encodeURIComponent(message)}`;
}

export default function Storefront({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [mainCategory, setMainCategory] = useState<MainCategory>('all');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wished, setWished] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() as Promise<Product[]> : Promise.reject())
      .then((data) => setProducts(data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) {
        setWished(new Set(saved.filter((id): id is string => typeof id === 'string')));
      }
    } catch {
      window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function closeOverlays(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setSearchOpen(false);
      setMenuOpen(false);
    }
    window.addEventListener('keydown', closeOverlays);
    return () => window.removeEventListener('keydown', closeOverlays);
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.toLocaleLowerCase('uz');
    return products.filter((product) =>
      (filter === 'all' || (filter === 'accessories'
        ? product.category === 'aksessuar' || product.category === 'sumka'
        : product.category === filter)) &&
      product.name.toLocaleLowerCase('uz').includes(query),
    );
  }, [products, filter, search]);

  function selectMainCategory(category: MainCategory) {
    setMainCategory(category);
    setFilter(category === 'accessories' ? 'accessories' : 'all');
  }

  function toggleWish(id: string) {
    setWished((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // The favorite still works for this visit when browser storage is unavailable.
      }
      return next;
    });
  }

  return (
    <>
      <a className="skip-link" href="#top">Asosiy qismga o‘tish</a>
      <header className="site-header">
        <a className="logo" href="#top" aria-label="Robiya Shop bosh sahifa"><span>Robiya</span><small>shop</small></a>
        <nav id="main-navigation" className={`desktop-nav${menuOpen ? ' open' : ''}`} aria-label="Asosiy menyu">
          <a href="#new" onClick={() => setMenuOpen(false)}>Yangi</a>
          <a href="#collection" onClick={() => setMenuOpen(false)}>Kolleksiya</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Biz haqimizda</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Aloqa</a>
        </nav>
        <div className="header-actions">
          <button className="icon-btn search-toggle" type="button" aria-label={searchOpen ? 'Qidiruvni yopish' : 'Qidiruvni ochish'} aria-expanded={searchOpen} onClick={() => { setMenuOpen(false); setSearchOpen((open) => !open); }}>
            {searchOpen ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
          </button>
          <button className="menu-btn" type="button" aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'} aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => { setSearchOpen(false); setMenuOpen((open) => !open); }}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
      </header>

      <div className={`search-panel${searchOpen ? ' open' : ''}`} role="search" aria-hidden={!searchOpen}>
        <label htmlFor="search">Mahsulot qidiring</label>
        <div className="search-row">
          <input ref={searchInputRef} id="search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Masalan, ko‘ylak" autoComplete="off" tabIndex={searchOpen ? 0 : -1} />
          <button className="search-close" type="button" onClick={() => setSearchOpen(false)}>Yopish</button>
        </div>
      </div>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <img src="/assets/robiya-background.jpg" alt="Qizil ipak fonidagi Robiya Shop belgisi" fetchPriority="high" decoding="async" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow"><span /> Yangi kolleksiya · 2026</p>
            <h1 id="hero-title">Butun oila<br />uchun <em>uslub.</em></h1>
            <p>Ayollar, erkaklar va bolalar uchun didli, qulay kiyimlar.</p>
            <a className="primary-btn" href="#new">Xaridni boshlash <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <div className="hero-note"><span>01</span><p>Robiya Shop<br />Yangi mavsum</p></div>
        </section>

        <section className="benefit-strip" aria-label="Do‘kon xususiyatlari">
          <span>Yangi kolleksiya</span><i aria-hidden="true">✦</i><span>Qulay bichim</span><i aria-hidden="true">✦</i><span>Butun oila uchun</span><i aria-hidden="true">✦</i><span>Oson tanlov</span>
        </section>

        <section className="products-section" id="new">
          <div className="section-heading">
            <div><p className="eyebrow dark"><span /> Robiya katalogi</p><h2>Barcha bo‘limlar</h2></div>
            <div className="category-navigation">
              <div className="filters main-filters" role="group" aria-label="Asosiy kategoriyalar">
                {mainCategories.map(([value, label]) => {
                  const expandable = value === 'women' || value === 'men' || value === 'children';
                  return <button key={value} className={mainCategory === value ? 'active' : ''} aria-pressed={mainCategory === value} aria-expanded={expandable ? mainCategory === value : undefined} onClick={() => selectMainCategory(value)}>{label}</button>;
                })}
              </div>
              {(mainCategory === 'women' || mainCategory === 'men' || mainCategory === 'children') && (
                <div className="filters subfilters" role="group" aria-label={`${mainCategories.find(([value]) => value === mainCategory)?.[1]} ichki kategoriyalari`}>
                  {subcategories[mainCategory as ExpandableCategory].map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
                </div>
              )}
            </div>
          </div>
          <div className="product-grid" id="product-grid">
            {visibleProducts.map((product) => {
              const overrideStyle = product.imageUrl ? { backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined;
              return (
                <article className="product-card" data-category={product.category} data-name={product.name} key={product.id}>
                  {product.tag && <span className={`tag${product.tagClass ? ` ${product.tagClass}` : ''}`}>{product.tag}</span>}
                  <button className={`wish${wished.has(product.id) ? ' active' : ''}`} type="button" aria-label={`${product.name}ni sevimlilarga qo‘shish`} aria-pressed={wished.has(product.id)} onClick={() => toggleWish(product.id)}><Heart aria-hidden="true" fill={wished.has(product.id) ? 'currentColor' : 'none'} /></button>
                  <a className="product-contact" href={getTelegramOrderUrl(product)} target="_blank" rel="noopener noreferrer" aria-label={`${product.name} mahsulotini Telegram orqali buyurtma qilish`}>
                    <div className={`product-image ${product.imageClass}`} role="img" aria-label={product.name} style={overrideStyle} />
                    <div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>{formatPrice(product.price)}</strong></div>
                  </a>
                </article>
              );
            })}
          </div>
          {visibleProducts.length === 0 && <p className="empty-state">Hozircha mahsulotlar qo‘shilmagan.</p>}
        </section>

        <section className="collection" id="collection">
          <div className="collection-number">02</div>
          <div className="collection-copy"><p className="eyebrow"><span /> Robiya tanlovi</p><h2>Har bir kun.<br />Har bir <em>oila.</em></h2><p>Bir-biriga oson moslashadigan, uzoq xizmat qiladigan va oilaning har bir a’zosi uchun qulay liboslar.</p><a href="#new">Kolleksiyani tanlash <span>→</span></a></div>
        </section>

        <section className="about" id="about"><p>Biz kiyimni shunchaki obraz emas, <strong>o‘zingizni erkin ifodalash usuli</strong> deb bilamiz.</p></section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="contact-intro"><p className="eyebrow dark"><span /> Savolingiz bormi?</p><h2 id="contact-title">Siz bilan<br /><em>bog‘lanamiz.</em></h2><p>Mahsulot yoki o‘lcham bo‘yicha savollaringizga mamnuniyat bilan javob beramiz.</p><div className="contact-actions"><a className="primary-btn" href="tel:+998771931903">Qo‘ng‘iroq qilish <ArrowUpRight aria-hidden="true" /></a><a className="text-btn" href="https://t.me/Rob1ya_shop_uz" target="_blank" rel="noopener noreferrer">Telegram orqali yozish →</a></div></div>
          <div className="contact-details">
            <article><span>01 / Telefon</span><div className="phone-links"><a href="tel:+998771931903">+998 77 193 19 03</a><a href="tel:+998936944429">+998 93 694 44 29</a></div><p>Har kuni, 09:00–21:00</p></article>
            <article><span>02 / Manzil</span><a href="https://maps.app.goo.gl/Aa27ijGpr1aQRBTM7" target="_blank" rel="noopener noreferrer">Andijon viloyati, Xonobod shahri ↗</a><p>Manzilni Google Xaritalarda ochish</p></article>
            <article><span>03 / Ijtimoiy tarmoqlar</span><div className="social-links"><a href="https://t.me/Rob1ya_shop_uz" target="_blank" rel="noopener noreferrer">Do‘kon Telegrami ↗</a><a href="https://www.instagram.com/nod1ra_kambarova?stkn=MWt6aHBoYXo4ejZhdQ==" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div></article>
            <article><span>04 / Sotuvchi</span><a href="https://t.me/Nadira_KamBaRoVa" target="_blank" rel="noopener noreferrer">@Nadira_KamBaRoVa</a><p>Telegram orqali to‘g‘ridan-to‘g‘ri bog‘laning</p></article>
          </div>
        </section>
      </main>

      <footer><div><a className="logo" href="#top"><span>Robiya</span><small>shop</small></a><p><a href="tel:+998771931903">+998 77 193 19 03</a><br /><a href="tel:+998936944429">+998 93 694 44 29</a></p></div><div className="footer-links"><a href="#new">Do‘kon</a><a href="#about">Biz haqimizda</a><a href="#contact">Aloqa</a></div><p>© 2026 Robiya Shop</p></footer>
    </>
  );
}
