const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  // Prevent application crashing if Redis is unreachable
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("Redis client connected");
});

redis.on("error", (error) => {
  console.error("Redis client error:", error.message);
});

module.exports = redis;
