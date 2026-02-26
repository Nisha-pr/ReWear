const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
      },
    ],
    category: {
      type: String,
      required: true,
      enum: [
        'Tops',
        'Bottoms',
        'Dresses',
        'Outerwear',
        'Shoes',
        'Accessories',
        'Activewear',
        'Formal',
        'Kids',
        'Other',
      ],
    },
    type: {
      type: String,
      enum: ['Swap', 'Points', 'Both'],
      default: 'Both',
    },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom'],
      required: true,
    },
    condition: {
      type: String,
      enum: ['Brand New', 'Like New', 'Good', 'Fair', 'Worn'],
      required: true,
    },
    pointsValue: {
      type: Number,
      default: 50,
      min: 0,
    },
    tags: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'swapped', 'redeemed'],
      default: 'pending',
    },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Geospatial index
itemSchema.index({ 'location.coordinates': '2dsphere' });
itemSchema.index({ category: 1, size: 1, condition: 1 });
itemSchema.index({ status: 1, isAvailable: 1 });
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Item', itemSchema);
