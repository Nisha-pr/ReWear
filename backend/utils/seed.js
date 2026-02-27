require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Item = require('../models/Item');
const SustainabilityStats = require('../models/SustainabilityStats');

// Sample Cloudinary URLs for seeding (using stock clothing images)
const SAMPLE_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', publicId: 'seed1' },
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600', publicId: 'seed2' },
  { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600', publicId: 'seed3' },
  { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600', publicId: 'seed4' },
  { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', publicId: 'seed5' },
  { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600', publicId: 'seed6' },
  { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', publicId: 'seed7' },
  { url: 'https://images.unsplash.com/photo-1556821840-3a63f15232ce?w=600', publicId: 'seed8' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      SustainabilityStats.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin ReWear',
      email: 'admin@rewear.com',
      password: 'Admin@123',
      role: 'admin',
      provider: 'local',
      avatar: 'https://ui-avatars.com/api/?name=Admin+ReWear&background=1B5E20&color=fff',
      points: 1000,
      badges: ['Top Contributor', 'Eco Warrior'],
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    });

    // Create sample users
    const users = await User.create([
      {
        name: 'Priya Sharma',
        email: 'priya@rewear.com',
        password: 'User@123',
        provider: 'local',
        avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=4DB6AC&color=fff',
        points: 350,
        totalSwaps: 5,
        itemsListed: 8,
        badges: ['First Swap', '5 Swaps'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@rewear.com',
        password: 'User@123',
        provider: 'local',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=A5D6A7&color=fff',
        points: 200,
        totalSwaps: 3,
        itemsListed: 5,
        badges: ['First Swap'],
        location: { city: 'Delhi', state: 'Delhi', country: 'India' },
      },
      {
        name: 'Aanya Patel',
        email: 'aanya@rewear.com',
        password: 'User@123',
        provider: 'local',
        avatar: 'https://ui-avatars.com/api/?name=Aanya+Patel&background=1B5E20&color=fff',
        points: 500,
        totalSwaps: 10,
        itemsListed: 15,
        badges: ['First Swap', '5 Swaps', '10 Swaps', 'Eco Warrior', 'Top Contributor'],
        location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      },
    ]);

    // Create sample items
    const itemData = [
      {
        title: 'Flowy Summer Maxi Dress',
        description: 'Beautiful boho-style maxi dress in dusty rose. Perfect for beach trips or casual outings. Worn only twice, in excellent condition.',
        category: 'Dresses',
        size: 'M',
        condition: 'Like New',
        type: 'Both',
        pointsValue: 80,
        tags: ['summer', 'casual', 'boho', 'dress'],
        owner: users[0]._id,
        status: 'approved',
        images: [SAMPLE_IMAGES[0], SAMPLE_IMAGES[1]],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        averageRating: 4.5,
        reviewCount: 2,
      },
      {
        title: 'Vintage Denim Jacket',
        description: 'Classic vintage-style denim jacket from the 90s. Light wash with subtle distressing. A timeless wardrobe staple.',
        category: 'Outerwear',
        size: 'L',
        condition: 'Good',
        type: 'Swap',
        pointsValue: 120,
        tags: ['vintage', 'denim', 'jacket', 'casual'],
        owner: users[1]._id,
        status: 'approved',
        images: [SAMPLE_IMAGES[2]],
        location: { city: 'Delhi', state: 'Delhi', country: 'India' },
        averageRating: 4.8,
        reviewCount: 5,
      },
      {
        title: 'Silk Blouse - Office Ready',
        description: 'Elegant silk-blend blouse perfect for office wear. Ivory with subtle shimmer. Professionally dry-cleaned after last use.',
        category: 'Tops',
        size: 'S',
        condition: 'Like New',
        type: 'Points',
        pointsValue: 60,
        tags: ['formal', 'office', 'silk', 'blouse'],
        owner: users[2]._id,
        status: 'approved',
        images: [SAMPLE_IMAGES[3]],
        location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
        averageRating: 4.2,
        reviewCount: 3,
      },
      {
        title: 'High-Waist Palazzo Pants',
        description: 'Stylish wide-leg palazzo pants in emerald green. Very comfortable fabric (modal blend). Goes with anything!',
        category: 'Bottoms',
        size: 'M',
        condition: 'Brand New',
        type: 'Both',
        pointsValue: 70,
        tags: ['palazzo', 'wide-leg', 'elegant'],
        owner: users[0]._id,
        status: 'approved',
        images: [SAMPLE_IMAGES[4]],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        averageRating: 4.6,
        reviewCount: 4,
      },
      {
        title: 'Designer Sports Sneakers',
        description: 'Brand new white sports sneakers, bought but never worn (wrong size). Original box included.',
        category: 'Shoes',
        size: 'Free Size',
        condition: 'Brand New',
        type: 'Points',
        pointsValue: 150,
        tags: ['sneakers', 'sports', 'white', 'shoes'],
        owner: users[1]._id,
        status: 'approved',
        images: [SAMPLE_IMAGES[5]],
        location: { city: 'Delhi', state: 'Delhi', country: 'India' },
        averageRating: 4.9,
        reviewCount: 7,
      },
      {
        title: 'Cozy Knit Cardigan',
        description: 'Super soft oatmeal-colored knit cardigan. Perfect for autumn evenings. Has front pockets!',
        category: 'Tops',
        size: 'L',
        condition: 'Good',
        type: 'Both',
        pointsValue: 55,
        tags: ['cardigan', 'knit', 'cozy', 'autumn'],
        owner: users[2]._id,
        status: 'approved',
        images: [SAMPLE_IMAGES[6]],
        location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
        averageRating: 4.3,
        reviewCount: 2,
      },
      {
        title: 'Trendy Crop Top Set',
        description: 'Matching co-ord set – crop top + high-waist shorts in terracotta. Size S/M. Festival/brunch ready!',
        category: 'Tops',
        size: 'S',
        condition: 'Like New',
        type: 'Swap',
        pointsValue: 90,
        tags: ['coord', 'set', 'crop', 'summer', 'trendy'],
        owner: users[0]._id,
        status: 'approved',
        images: [SAMPLE_IMAGES[7]],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        averageRating: 4.7,
        reviewCount: 6,
      },
      {
        title: 'Formal Blazer - Charcoal',
        description: 'Professional charcoal blazer, perfect for interviews and meetings. Excellent tailoring.',
        category: 'Formal',
        size: 'M',
        condition: 'Like New',
        type: 'Both',
        pointsValue: 130,
        tags: ['blazer', 'formal', 'professional'],
        owner: users[2]._id,
        status: 'approved',
        images: [SAMPLE_IMAGES[2]],
        location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
        averageRating: 4.4,
        reviewCount: 3,
      },
    ];

    await Item.insertMany(itemData);

    // Create sustainability stats
    await SustainabilityStats.create({
      singleton: true,
      totalItemsReused: 247,
      totalWaterSaved: 667290, // liters
      totalCarbonSaved: 617, // kg CO2
      totalUsers: users.length + 1,
      totalSwaps: 189,
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@rewear.com / Admin@123');
    console.log('User 1: priya@rewear.com / User@123');
    console.log('User 2: rahul@rewear.com / User@123');
    console.log('User 3: aanya@rewear.com / User@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
