const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create or update order
router.post('/orders', orderController.createOrUpdateOrder);

// Get order by branch and table
router.get('/orders/:branch_id/:table_name', orderController.getOrder);

// Get all orders by branch
router.get('/orders/branch/:branch_id', orderController.getOrdersByBranch);

// Update order status
router.put('/orders/:id/status', orderController.updateOrderStatus);

module.exports = router;
