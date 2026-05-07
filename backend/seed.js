const db = require('./db');
const bcrypt = require('bcryptjs');

const products = [
  ['Floral Frock', 'Soft cotton frock for girls.', 'girl', '2-6', 24.99, 50, '/images/floral-frock.jpg', 'floral-frock'],
  ['Denim Dungaree Set', 'Boy denim dungaree with tee.', 'boy', '4-8', 29.99, 40, '/images/denim-dungaree-set.jpg', 'denim-dungaree-set'],
  ['Newborn Romper Pack', '3-pack comfy rompers.', 'unisex', '0-1', 19.99, 70, '/images/newborn-romper-pack.jpg', 'newborn-romper-pack'],
  ['Party Suit', 'Elegant boys party suit.', 'boy', '8-14', 49.99, 25, '/images/party-suit.jpg', 'party-suit'],
  ['Princess Gown', 'Special event gown for girls.', 'girl', '6-12', 54.99, 20, '/images/princess-gown.jpg', 'princess-gown']
];

const adminPassword = bcrypt.hashSync('Admin@123', 10);
db.run(`INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)`, ['Admin', 'admin@kidscorner.com', adminPassword, 'admin']);
products.forEach((p) => db.run(`INSERT OR IGNORE INTO products (name,description,gender,age_group,price,stock,image,slug) VALUES (?,?,?,?,?,?,?,?)`, p));
console.log('Seed complete');
