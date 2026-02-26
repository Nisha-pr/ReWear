const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to send token response
const sendToken = (user, statusCode, res) => {
  const token = user.generateToken();

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      points: user.points,
      badges: user.badges,
      totalSwaps: user.totalSwaps,
      itemsListed: user.itemsListed,
      location: user.location,
      provider: user.provider,
    },
  });
};

// ─── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, city, state, country } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      provider: 'local',
      location: { city, state, country },
    });

    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account banned. Contact support.' });
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── OAuth Callback Handler ──────────────────────────────────────────────────
exports.oauthCallback = (req, res) => {
  const token = req.user.generateToken();
  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
};

// ─── Logout ──────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

// ─── Update Profile ──────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, city, state, country } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (city || state || country) {
      updates.location = { city, state, country };
    }

    // Handle avatar upload
    if (req.file) {
      const { uploadToCloudinary } = require('../config/cloudinary');
      const result = await uploadToCloudinary(req.file.buffer, 'rewear/avatars');
      updates.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
