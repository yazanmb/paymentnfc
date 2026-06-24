const Order = require('../models/Order');

// Create or update order
exports.createOrUpdateOrder = async (req, res) => {
  try {
    const { branch_id, merchant_id, table_name, amount } = req.body;

    if (!branch_id || !merchant_id || !table_name || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if order already exists for this branch and table
    const existingOrder = await Order.findByBranchAndTable(branch_id, table_name);

    let order;
    if (existingOrder) {
      // Update existing order amount
      order = await Order.updateAmount(existingOrder.id, amount);
    } else {
      // Create new order
      order = await Order.create({
        branch_id,
        merchant_id,
        table_name,
        amount,
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating/updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get order by branch and table
exports.getOrder = async (req, res) => {
  try {
    const { branch_id, table_name } = req.params;

    const order = await Order.findByBranchAndTable(branch_id, table_name);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all orders by branch
exports.getOrdersByBranch = async (req, res) => {
  try {
    const { branch_id } = req.params;

    const orders = await Order.findByBranch(branch_id);

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.updateStatus(id, status);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
