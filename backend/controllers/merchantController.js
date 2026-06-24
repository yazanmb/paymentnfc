const Merchant = require('../models/Merchant');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Create merchant
const createMerchant = async (req, res) => {
  try {
    const { business_name, email, phone, password, stripe_api_key } = req.body;

    if (!business_name || !email || !password) {
      return res.status(400).json({ 
        error: 'business_name, email, and password are required' 
      });
    }

    // Check if merchant already exists
    const existingMerchant = await Merchant.findByEmail(email);
    if (existingMerchant) {
      return res.status(400).json({ error: 'Merchant with this email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const merchant = await Merchant.create({
      business_name,
      email,
      phone,
      password_hash,
      stripe_account_id: stripe_api_key
    });

    // Remove password_hash from response
    const { password_hash: _, ...merchantData } = merchant;

    res.status(201).json({ 
      message: 'Merchant created successfully',
      merchant: merchantData
    });
  } catch (error) {
    console.error('Error creating merchant:', error);
    res.status(500).json({ 
      error: 'Error creating merchant',
      details: error.message 
    });
  }
};

// Get all merchants
const getAllMerchants = async (req, res) => {
  try {
    const query = 'SELECT id, business_name, email, phone, stripe_account_id, created_at, updated_at FROM merchants ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get merchant by ID
const getMerchantById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchant = await Merchant.findById(id);
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Remove password_hash from response
    const { password_hash: _, ...merchantData } = merchant;

    res.status(200).json(merchantData);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update merchant
const updateMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_name, email, phone, stripe_account_id } = req.body;

    const query = `
      UPDATE merchants 
      SET business_name = COALESCE($1, business_name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          stripe_account_id = COALESCE($4, stripe_account_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, business_name, email, phone, stripe_account_id, created_at, updated_at
    `;
    
    const result = await pool.query(query, [business_name, email, phone, stripe_account_id, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.status(200).json({ 
      message: 'Merchant updated successfully',
      merchant: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating merchant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete merchant
const deleteMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM merchants WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.status(200).json({ message: 'Merchant deleted successfully' });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  createMerchant, 
  getAllMerchants, 
  getMerchantById, 
  updateMerchant, 
  deleteMerchant 
};
