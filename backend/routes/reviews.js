const express = require('express');
const router = express.Router();
const { createReview, getItemReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/item/:itemId', getItemReviews);
router.post('/item/:itemId', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
