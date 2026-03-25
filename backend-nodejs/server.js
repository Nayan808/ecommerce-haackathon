// ShopEase E-Commerce — server.js (Node.js + Express)
// ⚠️ Contains intentional bugs for the Debugging Competition

const express = require('express');
const app     = express();
const PORT    = 3000;
// bug 1 
app.use(express.json());

// ===== IN-MEMORY DATA =====

let products = [
  { id:1,  name:'Wireless Bluetooth Earbuds',     cat:'electronics', price:1299, original:2499, rating:4.5, stock:15, sold:320  },
  { id:2,  name:'Smartphone Stand & Holder',       cat:'electronics', price:349,  original:699,  rating:4.2, stock:30, sold:150  },
  { id:3,  name:'Mechanical Keyboard RGB',         cat:'electronics', price:3499, original:4999, rating:4.7, stock:8,  sold:87   },
  { id:4,  name:'Men\'s Casual Slim Fit T-Shirt', cat:'fashion',     price:399,  original:799,  rating:4.3, stock:50, sold:540  },
  { id:5,  name:'Women\'s Running Shoes',          cat:'fashion',     price:1899, original:3499, rating:4.6, stock:20, sold:210  },
  { id:6,  name:'Stainless Steel Water Bottle 1L',cat:'home',        price:499,  original:999,  rating:4.4, stock:100,sold:890  },
  { id:7,  name:'Non-Stick Cookware Set 5-Piece', cat:'home',        price:2199, original:3999, rating:4.1, stock:12, sold:65   },
  { id:8,  name:'Atomic Habits — James Clear',    cat:'books',       price:299,  original:499,  rating:4.8, stock:200,sold:3400 },
  { id:9,  name:'The Lean Startup',               cat:'books',       price:349,  original:599,  rating:4.6, stock:80, sold:1200 },
  { id:10, name:'Yoga Mat Anti-Slip 6mm',         cat:'sports',      price:699,  original:1299, rating:4.5, stock:40, sold:430  },
  { id:11, name:'Resistance Bands Set (5-Pack)',  cat:'sports',      price:449,  original:899,  rating:4.3, stock:60, sold:670  },
  { id:12, name:'4K Action Camera Waterproof',    cat:'electronics', price:5999, original:9999, rating:4.6, stock:5,  sold:43   },
];

let users = [
  { id:1, name:'Aryan Shah',  email:'aryan@shop.io',  password:'aryan123', role:'admin' },
  { id:2, name:'Priya Mehta', email:'priya@shop.io',  password:'priya456', role:'user'  },
  { id:3, name:'Rahul Kumar', email:'rahul@shop.io',  password:'rahul789', role:'user'  },
];

let orders   = [];
let reviews  = [];
let sessions = {};
let coupons  = { SAVE10: 10, FLAT50: 50, WELCOME20: 20 };

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===========================
//   PRODUCT ROUTES
// ===========================

// GET /api/products — with optional ?cat=electronics&sort=price-asc
app.get('/api/products', (req, res) => {
  const { cat, sort, search } = req.query;
  let result = [...products];

  if (cat && cat !== 'all') result = result.filter(p => p.cat === cat);

  if (search) {
    result = result.filter(p => p.name.includes(search) || p.cat.includes(search));
  }

  if (sort === 'price-asc')  result.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (sort === 'rating')     result.sort((a, b) => b.rating - a.rating);
  if (sort === 'newest')     result.sort((a, b) => b.id - a.id);

  res.json({ success: true, data: result, count: result.length });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  // Strict equality (===) never matches — always returns 404.
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// POST /api/products (admin — add product)
app.post('/api/products', (req, res) => {
  const { name, cat, price, original, stock } = req.body;
  if (!name || !cat || !price) {
    return res.status(400).json({ success: false, message: 'name, cat and price are required' });
  }
  const newProduct = { id: products.length + 1, name, cat, price, original: original || price, rating: 0, stock: stock || 0, sold: 0 };
  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// PATCH /api/products/:id/stock
app.patch('/api/products/:id/stock', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const { qty } = req.body;
 // bug 3 changed price to stcok
  product.stock -= qty;

  res.json({ success: true, data: product });
});

// ===========================
//   USER & AUTH ROUTES
// ===========================

// POST /api/register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }
  const newUser = { id: users.length + 1, name, email, password, role: 'user' };
  users.push(newUser);
  res.status(201).json({ success: true, message: 'Account created', userId: newUser.id });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) { // bug 3 requestv 200 changed to 401 making unauthorised
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const token = genId();
  sessions[token] = { userId: user.id, name: user.name, role: user.role };
  const { password: _, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

// GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  // Password is correctly excluded here (contrast with Python version bug)
  const { password: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

// ===========================
//   ORDER ROUTES
// ===========================

// POST /api/orders
app.post('/api/orders', (req, res) => {
  const { userId, items, address, coupon } = req.body;

  if (!userId || !items || !items.length || !address) {
    return res.status(400).json({ success: false, message: 'userId, items and address are required' });
  }

  // Calculate total
  let subtotal = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
    subtotal += product.price * item.qty;
  }

  // Apply coupon
  let discount = 0;
  if (coupon && coupons[coupon.toUpperCase()]) {
    discount = (subtotal * coupons[coupon.toUpperCase()]) / 100;
  }
    // bug 4 subtotal formula changed with subtotoal- discoutn
  const total = subtotal - discount;

  const order = {
    id:        genId(),
    userId,
    items,
    address,
    subtotal,
    discount,
    total,
    status:    'pending',
    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  // Decrement stock
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (product) product.stock -= item.qty;
  }

  res.status(401).json({ success: true, data: order });
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: orders, count: orders.length });
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  order.status = status;
  res.json({ success: true, data: order });
});

// ===========================
//   REVIEW ROUTES
// ===========================

// POST /api/products/:id/reviews
app.post('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  const product   = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const { userId, rating, comment } = req.body;
  if (!userId || !rating) return res.status(400).json({ success: false, message: 'userId and rating are required' });

  const review = { id: genId(), productId, userId, rating: Number(rating), comment: comment || '', createdAt: new Date().toISOString() };
  reviews.push(review);

  // Recalculate product rating
  const productReviews = reviews.filter(r => r.productId === productId);
  product.rating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

  res.status(201).json({ success: true, data: review });
});

// GET /api/products/:id/reviews
app.get('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  const result    = reviews.filter(r => r.productId === productId);
  res.json({ success: true, data: result });
});

// ===========================
//   STATS (Admin)
// ===========================
// bug 5 fixed deliver to delivers
app.get('/api/stats', (req, res) => {
  const totalRevenue = orders
    // so revenue is always 0 because no order ever has status 'deliver'
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  res.json({
    success:       true,
    totalProducts: products.length,
    totalUsers:    users.length,
    totalOrders:   orders.length,
    totalRevenue,
  });
});

// ===========================
//   COUPON VALIDATE
// ===========================

app.post('/api/coupon/validate', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

  const discount = coupons[code.toUpperCase()];
  if (!discount) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

  res.json({ success: true, discount, message: `${discount}% discount applied!` });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`ShopEase API running at http://localhost:${PORT}`);
});

module.exports = app;
