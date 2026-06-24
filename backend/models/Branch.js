const pool = require('../config/database');

class Branch {
  static async create(branchData) {
    const { merchant_id, branch_name, address, city, country } = branchData;
    const query = `
      INSERT INTO branches (merchant_id, branch_name, address, city, country)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [merchant_id, branch_name, address, city, country];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM branches WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByMerchantId(merchant_id) {
    const query = 'SELECT * FROM branches WHERE merchant_id = $1';
    const result = await pool.query(query, [merchant_id]);
    return result.rows;
  }
}

module.exports = Branch;
