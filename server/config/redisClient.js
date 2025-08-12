import { createClient } from "redis";

const url = process.env.REDIS_URL;

if (!url) {
  console.log("=> ❌ Redis connection string (REDIS_URL) is missing!");
  process.exit(1);
}

export const Redis = createClient({ url });

Redis.on("error", (error) => {
  console.log("=> ❌ Redis connection error: ", error.message);
  process.exit(1);
});

Redis.on("ready", () => {
  console.log("=> ✅ Successfully connected to Redis.");
});

export const connectRedis = async () => {
  if (!Redis.isOpen) await Redis.connect();
};
