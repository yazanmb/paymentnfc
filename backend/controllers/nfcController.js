const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get sticker by UID
exports.getStickerByUid = async (req, res) => {
  try {
    const { sticker_uid } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM nfc_stickers WHERE sticker_uid = $1',
      [sticker_uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching sticker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Activate sticker
exports.activateSticker = async (req, res) => {
  try {
    const { sticker_uid, activation_code, branch_id, table_name } = req.body;

    // Validate inputs
    if (!sticker_uid || !activation_code || !branch_id || !table_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get sticker
    const stickerResult = await pool.query(
      'SELECT * FROM nfc_stickers WHERE sticker_uid = $1',
      [sticker_uid]
    );

    if (stickerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    const sticker = stickerResult.rows[0];

    // Check if already activated
    if (sticker.status === 'activated') {
      return res.status(400).json({ error: 'Sticker already activated' });
    }

    // Verify activation code
    if (sticker.activation_code !== activation_code) {
      return res.status(401).json({ error: 'Invalid activation code' });
    }

    // Verify branch exists
    const branchResult = await pool.query(
      'SELECT * FROM branches WHERE id = $1',
      [branch_id]
    );

    if (branchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Activate sticker
    const updateResult = await pool.query(
      `UPDATE nfc_stickers 
       SET branch_id = $1, table_name = $2, status = 'activated', activated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [branch_id, table_name, sticker.id]
    );

    res.json({
      success: true,
      sticker: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error activating sticker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Validate sticker for payment
exports.validateSticker = async (req, res) => {
  try {
    const { sticker_uid } = req.params;

    const result = await pool.query(
      'SELECT * FROM nfc_stickers WHERE sticker_uid = $1 AND status = $2',
      [sticker_uid, 'activated']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found or not activated' });
    }

    const sticker = result.rows[0];

    // Get branch details
    const branchResult = await pool.query(
      'SELECT * FROM branches WHERE id = $1',
      [sticker.branch_id]
    );

    // Get merchant details
    const merchantResult = await pool.query(
      'SELECT * FROM merchants WHERE id = $1',
      [branchResult.rows[0].merchant_id]
    );

    res.json({
      success: true,
      sticker: {
        ...sticker,
        branch: branchResult.rows[0],
        merchant: merchantResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error validating sticker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new sticker (for super admin)
exports.createSticker = async (req, res) => {
  try {
    const { sticker_uid, activation_code } = req.body;

    if (!sticker_uid || !activation_code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO nfc_stickers (sticker_uid, activation_code) VALUES ($1, $2) RETURNING *',
      [sticker_uid, activation_code]
    );

    res.status(201).json({ success: true, sticker: result.rows[0] });
  } catch (error) {
    console.error('Error creating sticker:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Sticker UID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all stickers (for super admin)
exports.getAllStickers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM nfc_stickers ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete sticker (for super admin)
exports.deleteSticker = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM nfc_stickers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    res.json({ success: true, message: 'Sticker deleted successfully' });
  } catch (error) {
    console.error('Error deleting sticker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
