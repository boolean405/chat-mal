import { createClient } from "redis";

const Redis = createClient({
  url: process.env.REDIS_URL,
});

Redis.on("error", (err) =>
  console.log("=> ❌ Redis Client Error!", err.message)
);

Redis.on("ready", () => {
  console.log("=> ✅ Successfully connected to Redis.");
});

await Redis.connect();

export default Redis;
