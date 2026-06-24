const express = require('express');
const router = express.Router();
const { createPayment, checkPayment, simulateNfcTap } = require('../controllers/paymentController');

// POST /api/create-payment - Create a new payment
router.post('/create-payment', createPayment);

// POST /api/simulate-nfc-tap - Simulate NFC Tap (Demo/Mock)
router.post('/simulate-nfc-tap', simulateNfcTap);

// GET /api/check-payment/:uid - Check payment status by NFC UID
router.get('/check-payment/:uid', checkPayment);

module.exports = router;
