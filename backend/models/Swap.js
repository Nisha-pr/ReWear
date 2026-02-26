const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['swap', 'points'],
      required: true,
    },
    // If swap type, the item offered in exchange
    offeredItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    // If points type
    pointsOffered: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    message: {
      type: String,
      maxlength: 500,
    },
    completedAt: Date,
    // Chat room ID (same as swap._id)
    chatRoomId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Set chatRoomId to the swap's own ID on creation
swapSchema.pre('save', function () {
  if (this.isNew) {
    this.chatRoomId = this._id.toString();
  }
});

module.exports = mongoose.model('Swap', swapSchema);
