const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const SustainabilityStats = require('../models/SustainabilityStats');

// Helper: award badges and update sustainability on swap completion
const onSwapCompleted = async (swap) => {
  // Update requester stats
  const requester = await User.findById(swap.requester);
  requester.totalSwaps += 1;
  requester.totalItemsReused += 1;
  requester.totalWaterSaved += 2700; // avg water saved per clothing item (liters)
  requester.totalCarbonSaved += 2.5; // avg CO2 saved per item (kg)
  await requester.save();
  await requester.checkAndAwardBadges();

  // Update owner stats
  const owner = await User.findById(swap.owner);
  owner.totalSwaps += 1;
  owner.totalItemsReused += 1;
  owner.totalWaterSaved += 2700;
  owner.totalCarbonSaved += 2.5;
  await owner.save();
  await owner.checkAndAwardBadges();

  // Update global stats
  await SustainabilityStats.findOneAndUpdate(
    { singleton: true },
    {
      $inc: {
        totalItemsReused: 1,
        totalWaterSaved: 2700,
        totalCarbonSaved: 2.5,
        totalSwaps: 1,
      },
    },
    { upsert: true }
  );

  // Mark item as swapped/unavailable
  await Item.findByIdAndUpdate(swap.item, {
    status: swap.type === 'points' ? 'redeemed' : 'swapped',
    isAvailable: false,
  });
};

// ─── Create Swap Request ──────────────────────────────────────────────────────
exports.createSwap = async (req, res, next) => {
  try {
    const { itemId, type, offeredItemId, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (!item.isAvailable || item.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Item is not available' });
    }
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot swap your own item' });
    }

    // Check for existing swap request
    const existingSwap = await Swap.findOne({
      item: itemId,
      requester: req.user._id,
      status: 'pending',
    });
    if (existingSwap) {
      return res.status(400).json({ success: false, message: 'Swap request already sent' });
    }

    // Point redemption
    if (type === 'points') {
      const requester = await User.findById(req.user._id);
      if (requester.points < item.pointsValue) {
        return res.status(400).json({ success: false, message: 'Insufficient points' });
      }
      // Deduct points immediately on request
      requester.points -= item.pointsValue;
      await requester.save();
    }

    const swap = await Swap.create({
      item: itemId,
      requester: req.user._id,
      owner: item.owner,
      type,
      offeredItem: offeredItemId || null,
      pointsOffered: type === 'points' ? item.pointsValue : 0,
      message,
    });

    await swap.populate([
      { path: 'item', select: 'title images' },
      { path: 'requester', select: 'name avatar' },
      { path: 'owner', select: 'name avatar' },
    ]);

    res.status(201).json({ success: true, swap });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Swaps ─────────────────────────────────────────────────────────────
exports.getMySwaps = async (req, res, next) => {
  try {
    const swaps = await Swap.find({
      $or: [{ requester: req.user._id }, { owner: req.user._id }],
    })
      .populate('item', 'title images pointsValue')
      .populate('requester', 'name avatar')
      .populate('owner', 'name avatar')
      .populate('offeredItem', 'title images')
      .sort({ createdAt: -1 });

    res.json({ success: true, swaps });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Swap ──────────────────────────────────────────────────────────
exports.getSwap = async (req, res, next) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('item', 'title images pointsValue category')
      .populate('requester', 'name avatar email')
      .populate('owner', 'name avatar email')
      .populate('offeredItem', 'title images');

    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });

    const isParticipant =
      swap.requester._id.toString() === req.user._id.toString() ||
      swap.owner._id.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, swap });
  } catch (error) {
    next(error);
  }
};

// ─── Update Swap Status ───────────────────────────────────────────────────────
exports.updateSwapStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });

    // Only owner can accept/reject
    if (
      ['accepted', 'rejected'].includes(status) &&
      swap.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Only item owner can accept/reject' });
    }

    // Only requester can cancel
    if (status === 'cancelled' && swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only requester can cancel' });
    }

    // Both parties must confirm completion
    if (status === 'completed') {
      if (swap.status !== 'accepted') {
        return res.status(400).json({ success: false, message: 'Swap must be accepted first' });
      }
    }

    swap.status = status;
    if (status === 'completed') {
      swap.completedAt = new Date();
      await onSwapCompleted(swap);
    }

    // Refund points if rejected/cancelled
    if (['rejected', 'cancelled'].includes(status) && swap.type === 'points') {
      await User.findByIdAndUpdate(swap.requester, {
        $inc: { points: swap.pointsOffered },
      });
    }

    await swap.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(swap.chatRoomId).emit('swap:statusUpdate', { swapId: swap._id, status });
    }

    res.json({ success: true, swap });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Get All Swaps ─────────────────────────────────────────────────────
exports.getAllSwaps = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};

    const total = await Swap.countDocuments(query);
    const swaps = await Swap.find(query)
      .populate('item', 'title images')
      .populate('requester', 'name avatar')
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, swaps, total });
  } catch (error) {
    next(error);
  }
};
