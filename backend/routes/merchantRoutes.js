const express = require('express');
const router = express.Router();
const { createMerchant, getAllMerchants, getMerchantById, updateMerchant, deleteMerchant } = require('../controllers/merchantController');

// POST /api/merchants - Create a new merchant
router.post('/', createMerchant);

// GET /api/merchants - Get all merchants
router.get('/', getAllMerchants);

// GET /api/merchants/:id - Get merchant by ID
router.get('/:id', getMerchantById);

// PUT /api/merchants/:id - Update merchant
router.put('/:id', updateMerchant);

// DELETE /api/merchants/:id - Delete merchant
router.delete('/:id', deleteMerchant);

module.exports = router;
