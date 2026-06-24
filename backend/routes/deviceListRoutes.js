const express = require('express');
const router = express.Router();
const { getAllDevices, getDeviceById, getDevicesByBranchId, updateDevice, deleteDevice } = require('../controllers/deviceListController');

// GET /api/devices - Get all devices
router.get('/', getAllDevices);

// GET /api/devices/:id - Get device by ID
router.get('/:id', getDeviceById);

// GET /api/devices/branch/:branchId - Get devices by branch ID
router.get('/branch/:branchId', getDevicesByBranchId);

// PUT /api/devices/:id - Update device
router.put('/:id', updateDevice);

// DELETE /api/devices/:id - Delete device
router.delete('/:id', deleteDevice);

module.exports = router;
