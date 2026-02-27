const Review = require('../models/Review');
const Item = require('../models/Item');

// ─── Create Review ────────────────────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const itemId = req.params.itemId;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Check for existing review
    const existing = await Review.findOne({ user: req.user._id, item: itemId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this item' });
    }

    const review = await Review.create({
      user: req.user._id,
      item: itemId,
      rating,
      comment,
    });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// ─── Get Item Reviews ─────────────────────────────────────────────────────────
exports.getItemReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Review ────────────────────────────────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
