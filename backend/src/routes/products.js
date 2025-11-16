const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// List products with optional search
router.get('/', async (req, res) => {
  const { q } = req.query;
  try {
    let sql = 'SELECT * FROM products ORDER BY id DESC';
    let params = [];
    if (q) {
      sql = 'SELECT * FROM products WHERE sku LIKE ? OR name LIKE ? OR category LIKE ? ORDER BY id DESC';
      const like = `%${q}%`;
      params = [like, like, like];
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  const { sku, name, category, cost_price, sell_price, quantity, low_stock_threshold } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (sku, name, category, cost_price, sell_price, quantity, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sku, name, category, cost_price ?? 0, sell_price ?? 0, quantity ?? 0, low_stock_threshold ?? 0]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  const { sku, name, category, cost_price, sell_price, quantity, low_stock_threshold } = req.body;
  try {
    await pool.query(
      'UPDATE products SET sku=?, name=?, category=?, cost_price=?, sell_price=?, quantity=?, low_stock_threshold=? WHERE id=?',
      [sku, name, category, cost_price, sell_price, quantity, low_stock_threshold, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Low stock alerts
router.get('/alerts/low', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE quantity <= low_stock_threshold ORDER BY quantity ASC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
