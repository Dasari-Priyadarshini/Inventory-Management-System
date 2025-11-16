# Inventory Management System (MVP)

Full-stack web app to manage products, sales, and stock levels.

## Tech
- Backend: Node.js, Express, MySQL (mysql2), dotenv, cors
- Frontend: HTML, CSS, vanilla JS

## Setup
1. Create DB and tables:
   - Open MySQL client and run:
   ```sql
   SOURCE backend/schema.sql;
   ```
2. Configure environment:
   - Copy `backend/.env.example` to `backend/.env` and set your DB credentials.
3. Install backend deps and run API (port 4000):
   - In `backend/` run:
   ```bash
   npm install
   npm run start
   ```
4. Open frontend:
   - Open `frontend/index.html` in your browser.

## API
- GET /api/products?q=
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/products/alerts/low
- POST /api/sales
- GET /api/sales/:id
- GET /api/stock-movements
- POST /api/stock-movements

## Notes
- Sales deduct stock and record stock movements.
- Basic validation, no auth in MVP.
- CORS enabled for local frontend.
