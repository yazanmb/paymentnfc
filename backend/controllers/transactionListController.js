const Transaction = require('../models/Transaction');
const pool = require('../config/database');

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const query = `
      SELECT t.*, d.device_name, d.device_uid, b.branch_name, m.business_name as merchant_name
      FROM transactions t
      LEFT JOIN devices d ON t.device_id = d.id
      LEFT JOIN branches b ON t.branch_id = b.id
      LEFT JOIN merchants m ON t.merchant_id = m.id
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      error: 'Error fetching transactions',
      details: error.message 
    });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get transactions by device ID
const getTransactionsByDeviceId = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const transactions = await Transaction.findByDeviceId(deviceId);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions by device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get transactions by merchant ID
const getTransactionsByMerchantId = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const transactions = await Transaction.findByMerchantId(merchantId);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions by merchant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  getAllTransactions, 
  getTransactionById, 
  getTransactionsByDeviceId,
  getTransactionsByMerchantId
};
