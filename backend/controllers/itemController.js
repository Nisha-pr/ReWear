const Item = require('../models/Item');
const User = require('../models/User');
const SustainabilityStats = require('../models/SustainabilityStats');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// ─── Create Item ──────────────────────────────────────────────────────────────
exports.createItem = async (req, res, next) => {
  try {
    const {
      title, description, category, type, size,
      condition, pointsValue, tags, city, state, country,
    } = req.body;

    // Upload images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'rewear/items');
        images.push({ url: result.secure_url, publicId: result.public_id });
      }
    }

    const item = await Item.create({
      title,
      description,
      images,
      category,
      type,
      size,
      condition,
      pointsValue: pointsValue || 50,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      owner: req.user._id,
      location: { city, state, country },
      status: 'pending', // Requires admin approval
    });

    // Update user's itemsListed count
    await User.findByIdAndUpdate(req.user._id, { $inc: { itemsListed: 1 } });

    // Check for badges
    const user = await User.findById(req.user._id);
    await user.checkAndAwardBadges();

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Items (with filters & pagination) ────────────────────────────────
exports.getItems = async (req, res, next) => {
  try {
    const {
      category, size, condition, type, tags, minPoints, maxPoints,
      city, search, sort, page = 1, limit = 12, lat, lng, radius,
    } = req.query;

    const query = { status: 'approved', isAvailable: true };

    if (category) query.category = category;
    if (size) query.size = size;
    if (condition) query.condition = condition;
    if (type) query.type = type;
    if (tags) query.tags = { $in: tags.split(',') };
    if (minPoints || maxPoints) {
      query.pointsValue = {};
      if (minPoints) query.pointsValue.$gte = Number(minPoints);
      if (maxPoints) query.pointsValue.$lte = Number(maxPoints);
    }
    if (city) query['location.city'] = { $regex: city, $options: 'i' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Geospatial query
    if (lat && lng) {
      query['location.coordinates'] = {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: (radius || 50) * 1000, // km to meters
        },
      };
    }

    // Sort options
    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { views: -1 };
    if (sort === 'rating') sortObj = { averageRating: -1 };
    if (sort === 'points-asc') sortObj = { pointsValue: 1 };
    if (sort === 'points-desc') sortObj = { pointsValue: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('owner', 'name avatar location')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      items,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Item ──────────────────────────────────────────────────────────
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name avatar points badges location totalSwaps bio')
      .lean();

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Increment view count
    await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Get other items by same owner
    const ownerItems = await Item.find({
      owner: item.owner._id,
      _id: { $ne: item._id },
      status: 'approved',
      isAvailable: true,
    })
      .limit(4)
      .select('title images pointsValue condition')
      .lean();

    res.json({ success: true, item, ownerItems });
  } catch (error) {
    next(error);
  }
};

// ─── Update Item ──────────────────────────────────────────────────────────────
exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, item: updated });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Item ──────────────────────────────────────────────────────────────
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete images from Cloudinary
    for (const img of item.images) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Get Featured Items ───────────────────────────────────────────────────────
exports.getFeaturedItems = async (req, res, next) => {
  try {
    const items = await Item.find({ status: 'approved', isAvailable: true })
      .sort({ averageRating: -1, views: -1 })
      .limit(8)
      .populate('owner', 'name avatar')
      .lean();

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Items ─────────────────────────────────────────────────────────────
exports.getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Approve/Reject Item ───────────────────────────────────────────────
exports.updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('owner', 'name email');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // If approved, update sustainability stats
    if (status === 'approved') {
      await SustainabilityStats.findOneAndUpdate(
        { singleton: true },
        { $inc: { totalItemsReused: 1 } },
        { upsert: true }
      );
    }

    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};
