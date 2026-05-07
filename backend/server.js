require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors());
app.use(express.json());

const auth = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (roles.length && !roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hash], function (err) {
    if (err) return res.status(400).json({ message: 'Email already exists' });
    res.json({ id: this.lastID, name, email });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email=?', [email], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name });
  });
});

app.get('/api/products', (req, res) => {
  const q = req.query.q || '';
  db.all('SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY id DESC', [`%${q}%`, `%${q}%`], (_, rows) => res.json(rows));
});

app.post('/api/products', auth(['admin']), (req, res) => {
  const { name, description, gender, age_group, price, stock, image, slug } = req.body;
  db.run('INSERT INTO products (name,description,gender,age_group,price,stock,image,slug) VALUES (?,?,?,?,?,?,?,?)',
    [name, description, gender, age_group, price, stock, image, slug], function (err) {
      if (err) return res.status(400).json({ message: 'Invalid product / slug exists' });
      res.json({ id: this.lastID });
    });
});

app.post('/api/orders', auth(['customer', 'admin']), (req, res) => {
  const { items, payment_method, shipping_address } = req.body;
  const accepted = ['credit_card', 'debit_card', 'easypaisa', 'jazzcash'];
  if (!accepted.includes(payment_method)) return res.status(400).json({ message: 'Unsupported payment method' });

  const ids = items.map(i => i.product_id);
  db.all(`SELECT * FROM products WHERE id IN (${ids.map(() => '?').join(',')})`, ids, (err, products) => {
    if (!products?.length) return res.status(400).json({ message: 'No valid items' });
    let total = 0;
    const details = items.map(i => {
      const p = products.find(pr => pr.id === i.product_id);
      if (!p) return null;
      total += p.price * i.quantity;
      return { ...i, price: p.price };
    }).filter(Boolean);

    db.run('INSERT INTO orders (user_id,total,payment_method,payment_status,shipping_address,created_at) VALUES (?,?,?,?,?,?)',
      [req.user.id, total, payment_method, 'paid', shipping_address, new Date().toISOString()], function () {
        const orderId = this.lastID;
        details.forEach(d => db.run('INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)', [orderId, d.product_id, d.quantity, d.price]));
        res.json({ order_id: orderId, total, payment_status: 'paid', gateway_ref: `SIM-${Date.now()}` });
      });
  });
});

app.get('/api/admin/orders', auth(['admin']), (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', (_, rows) => res.json(rows));
});

app.get('/health', (_, res) => res.send('OK'));
app.listen(PORT, () => console.log(`API running on ${PORT}`));
