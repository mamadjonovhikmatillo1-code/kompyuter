const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const fmt = n => n.toLocaleString('ru-RU') + ' so‘m';
const body = document.body;
let cart = JSON.parse(localStorage.getItem('korpus-cart') || '[]');

const save = () => {
  localStorage.setItem('korpus-cart', JSON.stringify(cart));
  render();
};

function render() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
  $$('.cart-count').forEach(e => (e.textContent = count));
  $('#cartTotal').textContent = fmt(total);
  $('#cartEmpty').hidden = cart.length > 0;
  $('#checkout').disabled = !cart.length;
  $('#cartItems').innerHTML = cart.map(i => `
    <li class="cart-item" data-id="${i.id}">
      <img src="${i.img}" alt="${i.name}">
      <div class="ci-info">
        <h4>${i.name}</h4>
        <span>${fmt(i.price * i.qty)}</span>
        <div class="qty"><button data-act="dec">−</button><b>${i.qty}</b><button data-act="inc">+</button></div>
      </div>
      <button class="ci-remove" data-act="del" aria-label="O‘chirish">×</button>
    </li>`).join('');
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t.timer);
  t.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function add(btn) {
  const { id, name, price, img } = btn.dataset;
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, name, img, price: +price, qty: 1 });
  save();
  toast(`${name} savatga qo‘shildi`);
  btn.classList.add('added');
  setTimeout(() => btn.classList.remove('added'), 800);
}

function change(btn) {
  const act = btn.dataset.act, id = btn.closest('.cart-item').dataset.id;
  const item = cart.find(i => i.id === id);
  item.qty += act === 'inc' ? 1 : act === 'dec' ? -1 : -item.qty;
  cart = cart.filter(i => i.qty > 0);
  save();
}

function filter(btn) {
  const f = btn.dataset.filter;
  $$('[data-filter]').forEach(b => b.classList.toggle('active', b === btn));
  $$('.product').forEach(p => p.classList.toggle('hide', f !== 'all' && p.dataset.cat !== f));
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-add],[data-act],[data-cart],[data-filter],.burger,.nav a');
  if (!t) return;
  if (t.matches('[data-add]')) add(t);
  if (t.matches('[data-act]')) change(t);
  if (t.matches('[data-filter]')) filter(t);
  if (t.matches('[data-cart]')) body.classList.toggle('cart-open', t.dataset.cart === 'open');
  if (t.matches('.burger')) body.classList.toggle('menu-open');
  if (t.matches('.nav a')) body.classList.remove('menu-open');
});

$('#checkout').onclick = () => { cart = []; save(); body.classList.remove('cart-open'); toast('Buyurtmangiz qabul qilindi! Tez orada bog‘lanamiz.'); };
$('#subscribe').onsubmit = e => { e.preventDefault(); e.target.reset(); toast('Obuna bo‘ldingiz, rahmat!'); };
document.addEventListener('keydown', e => e.key === 'Escape' && body.classList.remove('cart-open'));
window.addEventListener('scroll', () => $('.header').classList.toggle('scrolled', scrollY > 30));
const io = new IntersectionObserver(es => es.forEach(en => en.isIntersecting && en.target.classList.add('in')), { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));
render();
