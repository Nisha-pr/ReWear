const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const SustainabilityStats = require('../models/SustainabilityStats');

// ─── Get Admin Dashboard Stats ────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalItems, totalSwaps, pendingItems, stats] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Swap.countDocuments(),
      Item.countDocuments({ status: 'pending' }),
      SustainabilityStats.findOne({ singleton: true }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalItems,
        totalSwaps,
        pendingItems,
        sustainability: stats || {},
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Users ────────────────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]} : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, users, total });
  } catch (error) {
    next(error);
  }
};

// ─── Ban / Unban User ─────────────────────────────────────────────────────────
exports.toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban an admin' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? 'User banned' : 'User unbanned',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Pending Items ────────────────────────────────────────────────────────
exports.getPendingItems = async (req, res, next) => {
  try {
    const items = await Item.find({ status: 'pending' })
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Items (Admin) ────────────────────────────────────────────────────
exports.getAllItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, items, total });
  } catch (error) {
    next(error);
  }
};

// ─── Get Sustainability Stats ─────────────────────────────────────────────────
exports.getSustainabilityStats = async (req, res, next) => {
  try {
    let stats = await SustainabilityStats.findOne({ singleton: true });
    if (!stats) {
      stats = await SustainabilityStats.create({ singleton: true });
    }
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};
