const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Create a sale with items
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { customer_name, items } = req.body; // items: [{product_id, quantity, unit_price}]
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items' });

    await conn.beginTransaction();

    // Calculate total
    let total = 0;
    for (const it of items) {
      total += Number(it.unit_price) * Number(it.quantity);
    }

    const [saleRes] = await conn.query(
      'INSERT INTO sales (customer_name, total_amount) VALUES (?, ?)',
      [customer_name || null, total]
    );

    for (const it of items) {
      // Ensure stock available
      const [prodRows] = await conn.query('SELECT id, quantity FROM products WHERE id=? FOR UPDATE', [it.product_id]);
      if (!prodRows.length) throw new Error('Product not found');
      const currentQty = Number(prodRows[0].quantity);
      if (currentQty < it.quantity) throw new Error('Insufficient stock');

      await conn.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?)',
        [saleRes.insertId, it.product_id, it.quantity, it.unit_price, it.quantity * it.unit_price]
      );

      await conn.query('UPDATE products SET quantity = quantity - ? WHERE id=?', [it.quantity, it.product_id]);

      await conn.query('INSERT INTO stock_movements (product_id, change_amount, reason) VALUES (?, ?, ?)', [it.product_id, -it.quantity, 'SALE']);
    }

    await conn.commit();
    const [sale] = await pool.query('SELECT * FROM sales WHERE id=?', [saleRes.insertId]);
    res.status(201).json({ ...sale[0], items });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally {
    conn.release();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [saleRows] = await pool.query('SELECT * FROM sales WHERE id=?', [req.params.id]);
    if (!saleRows.length) return res.status(404).json({ message: 'Not found' });
    const [itemRows] = await pool.query('SELECT * FROM sale_items WHERE sale_id=?', [req.params.id]);
    res.json({ ...saleRows[0], items: itemRows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
