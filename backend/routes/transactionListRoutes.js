const express = require('express');
const router = express.Router();
const { getAllTransactions, getTransactionById, getTransactionsByDeviceId, getTransactionsByMerchantId } = require('../controllers/transactionListController');

// GET /api/transactions - Get all transactions
router.get('/', getAllTransactions);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', getTransactionById);

// GET /api/transactions/device/:deviceId - Get transactions by device ID
router.get('/device/:deviceId', getTransactionsByDeviceId);

// GET /api/transactions/merchant/:merchantId - Get transactions by merchant ID
router.get('/merchant/:merchantId', getTransactionsByMerchantId);

module.exports = router;
