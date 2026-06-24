const express = require('express');
const router = express.Router();
const { createBranch, getAllBranches, getBranchById, getBranchesByMerchantId, updateBranch, deleteBranch } = require('../controllers/branchController');

// POST /api/branches - Create a new branch
router.post('/', createBranch);

// GET /api/branches - Get all branches
router.get('/', getAllBranches);

// GET /api/branches/:id - Get branch by ID
router.get('/:id', getBranchById);

// GET /api/branches/merchant/:merchantId - Get branches by merchant ID
router.get('/merchant/:merchantId', getBranchesByMerchantId);

// PUT /api/branches/:id - Update branch
router.put('/:id', updateBranch);

// DELETE /api/branches/:id - Delete branch
router.delete('/:id', deleteBranch);

module.exports = router;
