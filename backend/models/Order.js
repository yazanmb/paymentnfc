const pool = require('../config/database');

class Order {
  static async create(orderData) {
    const { branch_id, merchant_id, table_name, amount, currency } = orderData;
    const query = `
      INSERT INTO orders (branch_id, merchant_id, table_name, amount, currency)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [branch_id, merchant_id, table_name, amount, currency || 'USD'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByBranchAndTable(branch_id, table_name) {
    const query = `
      SELECT * FROM orders 
      WHERE branch_id = $1 AND table_name = $2 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [branch_id, table_name]);
    return result.rows[0];
  }

  static async updateAmount(id, amount) {
    const query = `
      UPDATE orders 
      SET amount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [amount, id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async findByBranch(branch_id) {
    const query = `
      SELECT * FROM orders 
      WHERE branch_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [branch_id]);
    return result.rows;
  }

  static async findByMerchant(merchant_id) {
    const query = `
      SELECT * FROM orders 
      WHERE merchant_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [merchant_id]);
    return result.rows;
  }
}

module.exports = Order;
