const Device = require('../models/Device');
const pool = require('../config/database');

// Get all devices
const getAllDevices = async (req, res) => {
  try {
    const query = `
      SELECT d.*, b.branch_name, m.business_name as merchant_name
      FROM devices d
      LEFT JOIN branches b ON d.branch_id = b.id
      LEFT JOIN merchants m ON b.merchant_id = m.id
      ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ 
      error: 'Error fetching devices',
      details: error.message 
    });
  }
};

// Get device by ID
const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findById(id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.status(200).json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ 
      error: 'Error fetching device',
      details: error.message 
    });
  }
};

// Get devices by branch ID
const getDevicesByBranchId = async (req, res) => {
  try {
    const { branchId } = req.params;
    const devices = await Device.findByBranchId(branchId);
    res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching devices by branch:', error);
    res.status(500).json({ 
      error: 'Error fetching devices by branch',
      details: error.message 
    });
  }
};

// Update device
const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { device_name, is_active } = req.body;

    const query = `
      UPDATE devices 
      SET device_name = COALESCE($1, device_name),
          is_active = COALESCE($2, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [device_name, is_active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.status(200).json({ 
      message: 'Device updated successfully',
      device: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ 
      error: 'Error updating device',
      details: error.message 
    });
  }
};

// Delete device
const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM devices WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.status(200).json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ 
      error: 'Error deleting device',
      details: error.message 
    });
  }
};

module.exports = { 
  getAllDevices, 
  getDeviceById, 
  getDevicesByBranchId,
  updateDevice, 
  deleteDevice 
};
