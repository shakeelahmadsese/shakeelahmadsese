# KidsCorner Ecommerce (Boys & Girls 0-14)

Complete starter ecommerce app with:
- Customer storefront (search, browse, register, login, checkout)
- Admin panel (`/admin.html`) for order monitoring
- Backend auth, product APIs, order creation and payment-method processing
- Payment options: credit card, debit card, Easypaisa, JazzCash (simulated gateway)
- SEO basics: metadata, robots.txt, sitemap.xml

## Run
```bash
npm install
npm run install:all
npm run seed -w backend
npm run dev
```

Frontend: http://localhost:5173  
Admin: http://localhost:5173/admin.html  
API: http://localhost:4000

## Default admin
- Email: `admin@kidscorner.com`
- Password: `Admin@123`

## Notes for production
- Replace simulated payments with real PSP SDKs (Stripe + local wallets APIs).
- Add SSL, email notifications, image storage/CDN, caching, analytics, and CI/CD.
- Deploy frontend/backend to hosting and set domain for SEO indexing.
