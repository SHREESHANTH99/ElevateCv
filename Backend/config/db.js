const mongoose = require('mongoose');
const connectDB = async () => {
  if (process.env.USE_IN_MEMORY_STORAGE === "true") {
    console.log("⚡ Running with In-Memory Mock Storage (USE_IN_MEMORY_STORAGE=true)");
    return;
  }
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI is not set. Defaulting to In-Memory Mock Storage.");
    process.env.USE_IN_MEMORY_STORAGE = "true";
    return;
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
    console.warn('⚠️ MongoDB connection error, falling back to In-Memory Mock Storage:', error.message);
    process.env.USE_IN_MEMORY_STORAGE = "true";
  }
};
module.exports = connectDB;