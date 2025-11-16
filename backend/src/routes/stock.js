const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Manual stock adjustment
router.post('/', async (req, res) => {
  const { product_id, change_amount, reason } = req.body; // change_amount can be positive (IN) or negative (OUT)
  try {
    await pool.query('UPDATE products SET quantity = quantity + ? WHERE id=?', [change_amount, product_id]);
    await pool.query('INSERT INTO stock_movements (product_id, change_amount, reason) VALUES (?, ?, ?)', [product_id, change_amount, reason || 'ADJUSTMENT']);
    const [prod] = await pool.query('SELECT * FROM products WHERE id=?', [product_id]);
    res.json(prod[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// List movements
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT sm.*, p.sku, p.name FROM stock_movements sm JOIN products p ON p.id = sm.product_id ORDER BY sm.id DESC LIMIT 200');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
