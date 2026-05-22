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
      lat, lng,
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
      status: 'approved',  // ← CHANGED: auto approve
      location: {
        city,
        state,
        country,
        coordinates: {
          type: 'Point',
          coordinates: [
            parseFloat(lng) || 0,
            parseFloat(lat) || 0,
          ],
        },
      },
    });

    // Update sustainability stats on every new item
    await SustainabilityStats.findOneAndUpdate(
      { singleton: true },
      { $inc: { totalItemsReused: 1 } },
      { upsert: true }
    );

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

    if (search) {
      query.$text = { $search: search };
    }

    if (lat && lng) {
      query['location.coordinates'] = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: (parseFloat(radius) || 50) * 1000,
        },
      };
    }

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

// ─── Get Nearby Items (for LocationMap) ──────────────────────────────────────
exports.getNearbyItems = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    const query = {
      status: 'approved',
      isAvailable: true,
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius) * 1000,
        },
      },
    };

    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }

    const items = await Item.find(query)
      .populate('owner', 'name avatar')
      .limit(100)
      .lean();

    const formatted = items.map(item => ({
      id: item._id,
      name: item.title,
      size: item.size,
      category: item.category.toLowerCase(),
      user: item.owner?.name || 'User',
      avatar: item.owner?.avatar || null,
      image: item.images?.[0]?.url || null,
      pointsValue: item.pointsValue,
      condition: item.condition,
      lat: item.location?.coordinates?.coordinates?.[1] || 0,
      lng: item.location?.coordinates?.coordinates?.[0] || 0,
      city: item.location?.city || '',
    }));

    res.json({ success: true, items: formatted });
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

    await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const ownerItems = await Item.find({
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