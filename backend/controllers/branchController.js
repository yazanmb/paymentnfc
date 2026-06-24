const Branch = require('../models/Branch');
const pool = require('../config/database');

// Create branch
const createBranch = async (req, res) => {
  try {
    const { merchant_id, branch_name, address, city, country } = req.body;

    if (!merchant_id || !branch_name) {
      return res.status(400).json({ 
        error: 'merchant_id and branch_name are required' 
      });
    }

    const branch = await Branch.create({
      merchant_id,
      branch_name,
      address,
      city,
      country
    });

    res.status(201).json({ 
      message: 'Branch created successfully',
      branch
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const query = 'SELECT * FROM branches ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get branch by ID
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.status(200).json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get branches by merchant ID
const getBranchesByMerchantId = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const branches = await Branch.findByMerchantId(merchantId);
    res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches by merchant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_name, address, city, country } = req.body;

    const query = `
      UPDATE branches 
      SET branch_name = COALESCE($1, branch_name),
          address = COALESCE($2, address),
          city = COALESCE($3, city),
          country = COALESCE($4, country),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [branch_name, address, city, country, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.status(200).json({ 
      message: 'Branch updated successfully',
      branch: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM branches WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  createBranch, 
  getAllBranches, 
  getBranchById, 
  getBranchesByMerchantId,
  updateBranch, 
  deleteBranch 
};
