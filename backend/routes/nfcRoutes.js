const express = require('express');
const router = express.Router();
const nfcController = require('../controllers/nfcController');

// Get sticker by UID
router.get('/nfc/stickers/:sticker_uid', nfcController.getStickerByUid);

// Get all stickers (for super admin)
router.get('/nfc/stickers', nfcController.getAllStickers);

// Activate sticker
router.post('/nfc/activate', nfcController.activateSticker);

// Validate sticker for payment
router.get('/nfc/validate/:sticker_uid', nfcController.validateSticker);

// Create new sticker (for super admin)
router.post('/nfc/stickers', nfcController.createSticker);

// Delete sticker (for super admin)
router.delete('/nfc/stickers/:id', nfcController.deleteSticker);

module.exports = router;
