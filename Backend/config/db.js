const mongoose = require('mongoose');
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Create a .env file with MONGODB_URI.');
  }
  try {
    console.log('🔍 Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      directConnection: false,
      maxPoolSize: 50 // Optimize Mongoose connection pooling  
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};
module.exports = connectDB;