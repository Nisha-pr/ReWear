const express = require('express');
const router = express.Router();
const {
  createItem, getItems, getItem, updateItem, deleteItem,
  getFeaturedItems, getMyItems, updateItemStatus,
} = require('../controllers/itemController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const SustainabilityStats = require('../models/SustainabilityStats');

// Public
router.get('/', getItems);
router.get('/featured', getFeaturedItems);

// Public sustainability stats (used on landing page for all visitors)
router.get('/stats/sustainability', async (req, res, next) => {
  try {
    let stats = await SustainabilityStats.findOne({ singleton: true });
    if (!stats) stats = await SustainabilityStats.create({ singleton: true });
    res.json({ success: true, stats });
  } catch (error) { next(error); }
});

// Protected (must be before /:id to avoid route conflict)
router.get('/user/my', protect, getMyItems);
router.post('/', protect, upload.array('images', 5), createItem);

router.get('/:id', getItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

// Admin
router.patch('/:id/status', protect, adminOnly, updateItemStatus);

module.exports = router;
