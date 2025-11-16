const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool } = require('./db');
const productsRouter = require('./routes/products');
const salesRouter = require('./routes/sales');
const stockRouter = require('./routes/stock');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/stock-movements', stockRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
