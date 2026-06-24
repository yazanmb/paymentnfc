const pool = require('../config/database');

class Device {
  static async create(deviceData) {
    const { branch_id, device_uid, device_name } = deviceData;
    const query = `
      INSERT INTO devices (branch_id, device_uid, device_name)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [branch_id, device_uid, device_name];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM devices WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUid(device_uid) {
    const query = `
      SELECT d.*, b.merchant_id 
      FROM devices d 
      JOIN branches b ON d.branch_id = b.id 
      WHERE d.device_uid = $1
    `;
    const result = await pool.query(query, [device_uid]);
    return result.rows[0];
  }

  static async activate(device_uid) {
    const query = `
      UPDATE devices 
      SET is_active = TRUE, activation_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE device_uid = $1
      RETURNING *
    `;
    const result = await pool.query(query, [device_uid]);
    return result.rows[0];
  }

  static async updateLastSeen(device_uid) {
    const query = `
      UPDATE devices 
      SET last_seen = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE device_uid = $1
      RETURNING *
    `;
    const result = await pool.query(query, [device_uid]);
    return result.rows[0];
  }

  static async findByBranchId(branch_id) {
    const query = 'SELECT * FROM devices WHERE branch_id = $1';
    const result = await pool.query(query, [branch_id]);
    return result.rows;
  }
}

module.exports = Device;
