const express = require('express');
const router = express.Router();
const {
  createItem, getItems, getItem, updateItem, deleteItem,
  getFeaturedItems, getMyItems, updateItemStatus,
  getNearbyItems,  // ← ADD
} = require('../controllers/itemController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const SustainabilityStats = require('../models/SustainabilityStats');

// Public
router.get('/', getItems);
router.get('/featured', getFeaturedItems);
router.get('/nearby', getNearbyItems);   // ← ADD (/:id se pehle hona chahiye)

// Public sustainability stats
router.get('/stats/sustainability', async (req, res, next) => {
  try {
    let stats = await SustainabilityStats.findOne({ singleton: true });
    if (!stats) stats = await SustainabilityStats.create({ singleton: true });
    res.json({ success: true, stats });
  } catch (error) { next(error); }
});

// Protected
router.get('/user/my', protect, getMyItems);
router.post('/', protect, upload.array('images', 5), createItem);

router.get('/:id', getItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

// Admin
router.patch('/:id/status', protect, adminOnly, updateItemStatus);

module.exports = router;