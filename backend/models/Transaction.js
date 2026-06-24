const pool = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const {
      device_id,
      merchant_id,
      branch_id,
      amount,
      currency,
      status = 'completed',
      customer_name,
      customer_email,
      nfc_uid,
      stripe_payment_intent_id
    } = transactionData;
    const query = `
      INSERT INTO transactions (
        device_id, merchant_id, branch_id, amount, currency, status,
        customer_name, customer_email, nfc_uid, stripe_payment_intent_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      device_id, merchant_id, branch_id, amount, currency, status,
      customer_name, customer_email, nfc_uid, stripe_payment_intent_id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE transactions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async updateStripePaymentIntent(id, stripe_payment_intent_id) {
    const query = `
      UPDATE transactions 
      SET stripe_payment_intent_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [stripe_payment_intent_id, id]);
    return result.rows[0];
  }

  static async findByDeviceId(device_id, limit = 50) {
    const query = `
      SELECT * FROM transactions 
      WHERE device_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [device_id, limit]);
    return result.rows;
  }

  static async findByMerchantId(merchant_id, limit = 100) {
    const query = `
      SELECT * FROM transactions 
      WHERE merchant_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [merchant_id, limit]);
    return result.rows;
  }

  static async findByNfcUid(nfc_uid) {
    const query = 'SELECT * FROM transactions WHERE nfc_uid = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await pool.query(query, [nfc_uid]);
    return result.rows[0];
  }

  static async findByStatus(status, limit = 50) {
    const query = `
      SELECT * FROM transactions 
      WHERE status = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [status, limit]);
    return result.rows;
  }
}

module.exports = Transaction;
