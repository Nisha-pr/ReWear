const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, toggleBanUser,
  getPendingItems, getAllItems, getSustainabilityStats,
} = require('../controllers/adminController');
const { updateItemStatus } = require('../controllers/itemController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/ban', toggleBanUser);
router.get('/items/pending', getPendingItems);
router.get('/items', getAllItems);
router.patch('/items/:id/status', updateItemStatus);
router.get('/sustainability', getSustainabilityStats);

module.exports = router;
