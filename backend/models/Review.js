const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// One review per user per item
reviewSchema.index({ user: 1, item: 1 }, { unique: true });

// Static method to update item's average rating
reviewSchema.statics.calcAverageRating = async function (itemId) {
  const Item = require('./Item');
  const stats = await this.aggregate([
    { $match: { item: itemId } },
    {
      $group: {
        _id: '$item',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Item.findByIdAndUpdate(itemId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Item.findByIdAndUpdate(itemId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

// Update rating on save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.item);
});

// Update rating on remove
reviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.item);
});

module.exports = mongoose.model('Review', reviewSchema);
