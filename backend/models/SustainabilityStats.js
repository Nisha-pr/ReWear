const mongoose = require('mongoose');

const sustainabilityStatsSchema = new mongoose.Schema(
  {
    totalItemsReused: { type: Number, default: 0 },
    totalWaterSaved: { type: Number, default: 0 }, // liters
    totalCarbonSaved: { type: Number, default: 0 }, // kg CO2
    totalUsers: { type: Number, default: 0 },
    totalSwaps: { type: Number, default: 0 },
    // Singleton pattern - only one document
    singleton: { type: Boolean, default: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SustainabilityStats', sustainabilityStatsSchema);
