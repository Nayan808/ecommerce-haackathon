// ShopEase E-Commerce — app.js
// ⚠️ Contains intentional bugs for the Debugging Competition

// ===== PRODUCT DATA =====
const allProducts = [
  { id:1,  name:'Wireless Bluetooth Earbuds',       cat:'electronics', price:1299, original:2499, rating:4.5, reviews:1240, emoji:'🎧', badge:'sale', stock:15 },
  { id:2,  name:'Smartphone Stand & Holder',         cat:'electronics', price:349,  original:699,  rating:4.2, reviews:532,  emoji:'📱', badge:'hot',  stock:30 },
  { id:3,  name:'Mechanical Keyboard RGB',           cat:'electronics', price:3499, original:4999, rating:4.7, reviews:876,  emoji:'⌨️', badge:'sale', stock:8  },
  { id:4,  name:'Men\'s Casual Slim Fit T-Shirt',   cat:'fashion',     price:399,  original:799,  rating:4.3, reviews:2100, emoji:'👕', badge:'new',  stock:50 },
  { id:5,  name:'Women\'s Running Shoes',            cat:'fashion',     price:1899, original:3499, rating:4.6, reviews:987,  emoji:'👟', badge:'sale', stock:20 },
  { id:6,  name:'Stainless Steel Water Bottle 1L',  cat:'home',        price:499,  original:999,  rating:4.4, reviews:3200, emoji:'🍶', badge:'hot',  stock:100},
  { id:7,  name:'Non-Stick Cookware Set 5-Piece',   cat:'home',        price:2199, original:3999, rating:4.1, reviews:654,  emoji:'🍳', badge:'sale', stock:12 },
  { id:8,  name:'Atomic Habits — James Clear',      cat:'books',       price:299,  original:499,  rating:4.8, reviews:8700, emoji:'📖', badge:'hot',  stock:200},
  { id:9,  name:'The Lean Startup',                 cat:'books',       price:349,  original:599,  rating:4.6, reviews:4100, emoji:'📚', badge:'new',  stock:80 },
  { id:10, name:'Yoga Mat Anti-Slip 6mm',           cat:'sports',      price:699,  original:1299, rating:4.5, reviews:1560, emoji:'🧘', badge:'sale', stock:40 },
  { id:11, name:'Resistance Bands Set (5-Pack)',    cat:'sports',      price:449,  original:899,  rating:4.3, reviews:2340, emoji:'💪', badge:'new',  stock:60 },
  { id:12, name:'4K Action Camera Waterproof',      cat:'electronics', price:5999, original:9999, rating:4.6, reviews:430,  emoji:'📷', badge:'hot',  stock:5  },
];

const COUPONS = { SAVE10: 10, FLAT50: 50, WELCOME20: 20 };

let cart      = [];
let wishlist  = [];
let displayed = [...allProducts];
let activeCategory = 'all';

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  renderProducts(allProducts);
});

// ===== RENDER PRODUCTS =====
function renderProducts(list) {
  displayed = list;
  const grid = document.getElementById('products-grid');
  document.getElementById('product-count').textContent =
    `Showing ${list.length} product${list.length !== 1 ? 's' : ''}`;

  if (list.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1; padding:40px 0">No products found.</p>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const discount = Math.round((1 - p.price / p.original) * 100);
    const stars    = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
    const isWished = wishlist.includes(p.id);
    return `
      <div class="product-card" onclick="openProduct(${p.id})">
        <span class="product-badge badge-${p.badge}">${p.badge}</span>
        <div class="product-img-wrap">${p.emoji}</div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-rating">${stars} <span>(${p.reviews.toLocaleString()})</span></div>
          <div class="product-price">
            <span class="price-current">₹${p.price.toLocaleString()}</span>
            <span class="price-original">₹${p.original.toLocaleString()}</span>
            <span class="price-discount">${discount}% off</span>
          </div>
          <div class="product-actions" onclick="event.stopPropagation()">
            <button class="btn-add-cart" onclick="addToCart(${p.id})">Add to Cart</button>
            <button class="btn-wishlist-icon ${isWished ? 'wishlisted' : ''}" onclick="toggleWishlistItem(${p.id})">❤️</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ===== FILTER CATEGORY =====
function filterCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.cat-btn[data-cat="${cat}"]`).classList.add('active');

  const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.cat === cat);
  renderProducts(filtered);
}

// ===== SORT =====
function sortProducts() {
  const val  = document.getElementById('sort-select').value;
  let sorted = [...displayed];

  if (val === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
  if (val === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (val === 'rating')     sorted.sort((a, b) => b.rating - a.rating);
  // So "Newest First" actually shows OLDEST first — the sort order is reversed
  // bug 1 newsest shows older 
  if (val === 'newest')     sorted.sort((a, b) => b.id - a.id);

  renderProducts(sorted);
}

// ===== SEARCH =====
function searchProducts() {
  const q = document.getElementById('search-input').value.trim();
  const result = allProducts.filter(p => // bug 2 lowercase support
    p.name.toLowerCase().includes(q.toLowerCase()) || p.cat.includes(q)
  );
  renderProducts(result);
}

// ===== OPEN PRODUCT MODAL =====
function openProduct(id) {
  const p        = allProducts.find(p => p.id === id);
  const discount = Math.round((1 - p.price / p.original) * 100);
  const stars    = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');

  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center; font-size:6rem; margin-bottom:16px">${p.emoji}</div>
    <h2 style="color:white; margin-bottom:8px; font-size:1.2rem">${p.name}</h2>
    <div style="color:var(--star); margin-bottom:8px">${stars} <span style="color:var(--text-muted)">(${p.reviews.toLocaleString()} reviews)</span></div>
    <div style="display:flex; gap:12px; align-items:center; margin-bottom:16px">
      <span style="font-size:1.6rem; font-weight:800; color:var(--primary)">₹${p.price.toLocaleString()}</span>
      <span style="text-decoration:line-through; color:var(--text-muted)">₹${p.original.toLocaleString()}</span>
      <span style="color:var(--success); font-weight:600">${discount}% off</span>
    </div>
    <p style="color:var(--text-muted); margin-bottom:16px; font-size:0.9rem">
      Category: <strong style="color:var(--text)">${p.cat}</strong> &nbsp;|&nbsp; In Stock: <strong style="color:var(--success)">${p.stock} units</strong>
    </p>
    <div style="display:flex; gap:10px; margin-top:8px">
      <button class="btn-primary" style="flex:1" onclick="addToCart(${p.id}); closeModal()">🛒 Add to Cart</button>
      <button class="btn-primary" style="background:var(--border); flex:1" onclick="toggleWishlistItem(${p.id}); closeModal()">❤️ Wishlist</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// ===== CART =====
function addToCart(id) {
  const product  = allProducts.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  showToast(`${product.name} added to cart! 🛒`, 'success');
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, c) => sum + c.qty, 0);
  document.getElementById('cart-count').textContent = count;

  const itemsEl = document.getElementById('cart-items');

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">🛒 Your cart is empty.<br>Start shopping!</div>`;
    document.getElementById('cart-total').textContent = '₹0';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-emoji">${item.emoji}</span>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price.toLocaleString()} each</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
        </div>
      </div>
      <button class="btn-remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
    </div>
  `).join('');

  // reduce returns the last computed value instead of accumulating — result is always last item total only.
  //bug 3 fixedd cummulative sum
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('cart-total').textContent = `₹${total.toLocaleString()}`;
}

function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  updateCartUI();
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

// ===== COUPON =====
function applyCoupon() {
  const code    = document.getElementById('coupon-input').value.trim().toUpperCase();
  const discount = COUPONS[code];

  if (!discount) {
    showToast('Invalid coupon code.', 'error');
    return;
  }

  showToast(`Coupon applied! ${discount}% discount unlocked. 🎉`, 'success');
}

// ===== WISHLIST =====
function toggleWishlistItem(id) {
  const idx = wishlist.indexOf(id);
  const product = allProducts.find(p => p.id === id);
  if (idx === -1) {
    wishlist.push(id);
    showToast(`${product.name} added to wishlist! ❤️`, 'info');
  } else {
    wishlist.splice(idx, 1);
    showToast(`Removed from wishlist.`, 'info');
  }
  document.getElementById('wishlist-count').textContent = wishlist.length;
  renderProducts(displayed);
}

function toggleWishlist() {
  showToast(`You have ${wishlist.length} item(s) in your wishlist.`, 'info');
}

// ===== CHECKOUT =====
function checkout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  closeCart();
  openLogin();
}

// ===== LOGIN MODAL =====
function openLogin() {
  document.getElementById('modal-content').innerHTML = `
    <h2>Login to ShopEase 🛍️</h2>
    <input type="email"    placeholder="Email address" id="login-email" />
    <input type="password" placeholder="Password"      id="login-pass" />
    <button class="btn-primary" type="button" onclick="handleLogin()">Login</button>
    <p style="text-align:center; margin-top:14px; font-size:0.85rem; color:var(--text-muted)">
      New here? <a href="#" style="color:var(--primary)" onclick="openRegister()">Create account</a>
    </p>
  `;
  document.getElementById('modal-overlay').classList.add('active');
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  if (!email || !pass) {
    showToast('Please enter email and password.', 'error');
    return;
  }

  closeModal();
  showToast('Logged in successfully! 🎉', 'success');
}

function openRegister() {
  document.getElementById('modal-content').innerHTML = `
    <h2>Create Account 🚀</h2>
    <input type="text"     placeholder="Full Name"        id="reg-name" />
    <input type="email"    placeholder="Email address"    id="reg-email" />
    <input type="password" placeholder="Password"         id="reg-pass" />
    <input type="password" placeholder="Confirm Password" id="reg-confirm" />
    <button class="btn-primary" type="button" onclick="handleRegister()">Create Account</button>
  `;
}

function handleRegister() {
  const name    = document.getElementById('reg-name').value.trim();
  const email   = document.getElementById('reg-email').value.trim();
  const pass    = document.getElementById('reg-pass').value;
  const confirm = document.getElementById('reg-confirm').value;

  if (!name || !email || !pass) {
    showToast('Please fill all fields.', 'error');
    return;
  }

  if (pass !== confirm) {
    closeModal();
    showToast(`Welcome to ShopEase, ${name}! 🎉`, 'success');
  }
}

// ===== NEWSLETTER =====
function subscribeNewsletter() {
  const email = document.getElementById('nl-email').value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !regex.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  showToast(`Subscribed! Check your inbox at ${email} 📬`, 'success');
  document.getElementById('nl-email').value = '';
}

// ===== SCROLL TO PRODUCTS =====
function scrollToProducts() {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ===== TOAST =====
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3200);
}
