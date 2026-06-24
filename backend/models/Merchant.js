const pool = require('../config/database');

class Merchant {
  static async create(merchantData) {
    const { business_name, email, phone, password_hash, stripe_account_id } = merchantData;
    const query = `
      INSERT INTO merchants (business_name, email, phone, password_hash, stripe_account_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [business_name, email, phone, password_hash, stripe_account_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM merchants WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM merchants WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async updateStripeAccount(id, stripe_account_id) {
    const query = `
      UPDATE merchants 
      SET stripe_account_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [stripe_account_id, id]);
    return result.rows[0];
  }
}

module.exports = Merchant;
