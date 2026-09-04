require("dotenv").config();
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
const express = require("express");
const compression = require("compression");
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
app.use(compression());

// --- STEP 0: Request Timing Middleware ---
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(2);
    console.log(`[REQ] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      // Vercel deployment URLs
      "https://elevate-cv-poob.vercel.app",
      "https://elevate-cv-poob-git-main-shreeshanth99s-projects.vercel.app",
      "https://elevate-cv-poob-f4xvs6zft-shreeshanth99s-projects.vercel.app",
      // Allow all Vercel preview deployments for this project
      /^https:\/\/elevate-cv-poob.*\.vercel\.app$/,
    ],
    credentials: true,
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(express.json({ limit: "2mb" })); // Prevent large payload DoS
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
const mongoose = require("mongoose");
const redisClient = require("./config/redis");
const { limiter: geminiLimiter } = require("./utils/geminiClient");

app.get("/api/health", async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? "ok" : "disconnected";
    let redisStatus = "disconnected";
    try {
      redisStatus = redisClient.status === "ready" ? "ok" : redisClient.status;
    } catch(e) {}
    
    let geminiQueue = { queued: 0, executing: 0 };
    try {
      const counts = geminiLimiter.counts();
      geminiQueue = { queued: counts.QUEUED || 0, executing: counts.EXECUTING || 0 };
    } catch(e) {}

    const status = (mongoStatus === "ok" && redisStatus === "ok") ? "ok" : "degraded";
    
    res.status(status === "ok" ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
        geminiQueue
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);

Sentry.setupExpressErrorHandler(app);

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
