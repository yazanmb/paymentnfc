const Device = require('../models/Device');
const Branch = require('../models/Branch');
const pool = require('../config/database');

// Activate device endpoint
const activateDevice = async (req, res) => {
  try {
    const { device_uid, branch_id, device_name } = req.body;

    if (!device_uid || !branch_id) {
      return res.status(400).json({ 
        error: 'device_uid and branch_id are required' 
      });
    }

    // Check if branch exists
    const branch = await Branch.findById(branch_id);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Check if device already exists
    const existingDevice = await Device.findByUid(device_uid);
    if (existingDevice) {
      // If device exists but is not active, activate it
      if (!existingDevice.is_active) {
        const activatedDevice = await Device.activate(device_uid);
        return res.status(200).json({ 
          message: 'Device activated successfully',
          device: activatedDevice
        });
      }
      // If device is already active, return it
      return res.status(200).json({ 
        message: 'Device already active',
        device: existingDevice
      });
    }

    // Create new device and activate it
    const newDevice = await Device.create({ 
      branch_id, 
      device_uid, 
      device_name: device_name || 'NFC Device' 
    });
    
    const activatedDevice = await Device.activate(device_uid);

    res.status(201).json({ 
      message: 'Device created and activated successfully',
      device: activatedDevice
    });
  } catch (error) {
    console.error('Error activating device:', error);
    res.status(500).json({ 
      error: 'Error activating device',
      details: error.message 
    });
  }
};

// Get all devices
const getAllDevices = async (req, res) => {
  try {
    const query = 'SELECT * FROM devices ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  activateDevice,
  getAllDevices,
  getDeviceById,
  deleteDevice
};
