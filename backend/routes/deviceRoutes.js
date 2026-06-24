const express = require('express');
const router = express.Router();
const { activateDevice, getAllDevices, getDeviceById, deleteDevice } = require('../controllers/deviceController');

// POST /api/activate - Activate a device
router.post('/activate', activateDevice);

// GET /api/devices - Get all devices
router.get('/devices', getAllDevices);

// GET /api/devices/:id - Get device by ID
router.get('/devices/:id', getDeviceById);

// DELETE /api/devices/:id - Delete device
router.delete('/devices/:id', deleteDevice);

module.exports = router;
