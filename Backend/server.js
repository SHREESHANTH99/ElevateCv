require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const aiRoutes = require("./routes/ai");
const connectDB = require("./config/db");
const { initializeFirebaseAdmin } = require("./config/firebase");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`🚀 Starting server in ${NODE_ENV} mode...`);
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: NODE_ENV === "development" ? err.message : {},
  });
});
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
const startServer = async () => {
  try {
    await connectDB();
    try {
      initializeFirebaseAdmin();
      console.log("✅ Firebase Admin initialized");
    } catch (firebaseError) {
      console.warn(
        "⚠️  Firebase Admin initialization failed:",
        firebaseError.message
      );
      console.warn("Firebase authentication will not be available");
    }
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${NODE_ENV}`);
      console.log(`📅 ${new Date().toISOString()}`);
      console.log("-----------------------------------");
    });
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.log("\n🔧 Troubleshooting Tips:");
    console.log("1. Check your internet connection");
    console.log("2. Verify MongoDB Atlas cluster is running");
    console.log("3. Check if your IP is whitelisted in MongoDB Atlas");
    console.log("4. Verify your database credentials in .env");
    console.log("5. Check if the database name is correct");
    process.exit(1);
  }
};
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
startServer();