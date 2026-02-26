const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=User&background=1B5E20&color=fff',
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    googleId: String,
    githubId: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    points: {
      type: Number,
      default: 100, // Welcome bonus points
    },
    totalSwaps: {
      type: Number,
      default: 0,
    },
    itemsListed: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
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
    isBanned: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    totalItemsReused: { type: Number, default: 0 },
    totalWaterSaved: { type: Number, default: 0 }, // liters
    totalCarbonSaved: { type: Number, default: 0 }, // kg
  },
  { timestamps: true }
);

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Award badges based on achievements
userSchema.methods.checkAndAwardBadges = async function () {
  const newBadges = [];

  if (this.totalSwaps >= 1 && !this.badges.includes('First Swap')) {
    newBadges.push('First Swap');
  }
  if (this.totalSwaps >= 5 && !this.badges.includes('5 Swaps')) {
    newBadges.push('5 Swaps');
  }
  if (this.totalSwaps >= 10 && !this.badges.includes('10 Swaps')) {
    newBadges.push('10 Swaps');
  }
  if (this.itemsListed >= 5 && !this.badges.includes('Top Contributor')) {
    newBadges.push('Top Contributor');
  }
  if (this.totalItemsReused >= 10 && !this.badges.includes('Eco Warrior')) {
    newBadges.push('Eco Warrior');
  }

  if (newBadges.length > 0) {
    this.badges.push(...newBadges);
    await this.save();
  }

  return newBadges;
};

module.exports = mongoose.model('User', userSchema);
