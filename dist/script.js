const cartCount = document.querySelector('.cart-count');
const toast = document.querySelector('.toast');
let cart = 0;
let toastTimer;

document.querySelectorAll('.add-btn').forEach((button) => {
  button.addEventListener('click', () => {
    cart += 1;
    cartCount.textContent = cart;
    button.firstChild.textContent = 'Qo‘shildi ';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  });
});

document.querySelectorAll('.wish').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('active');
    button.textContent = button.classList.contains('active') ? '♥' : '♡';
  });
});

const cards = [...document.querySelectorAll('.product-card')];
const empty = document.querySelector('.empty-state');
function showMatching(test) {
  let visible = 0;
  cards.forEach((card) => {
    const match = test(card);
    card.classList.toggle('hidden', !match);
    if (match) visible += 1;
  });
  empty.hidden = visible > 0;
}

document.querySelectorAll('.filters button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.filters .active').classList.remove('active');
    button.classList.add('active');
    const filter = button.dataset.filter;
    showMatching((card) => filter === 'all' || card.dataset.category === filter);
  });
});

const panel = document.querySelector('.search-panel');
const searchInput = document.querySelector('#search');
function setSearch(open) {
  panel.classList.toggle('open', open);
  panel.setAttribute('aria-hidden', String(!open));
  if (open) setTimeout(() => searchInput.focus(), 50);
}
document.querySelector('.search-toggle').addEventListener('click', () => setSearch(true));
document.querySelector('.search-close').addEventListener('click', () => setSearch(false));
searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLocaleLowerCase('uz');
  showMatching((card) => card.dataset.name.toLocaleLowerCase('uz').includes(query));
  document.querySelector('.filters .active')?.classList.remove('active');
});

const menuButton = document.querySelector('.menu-btn');
const nav = document.querySelector('.desktop-nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setSearch(false);
    nav.classList.remove('open');
  }
});
