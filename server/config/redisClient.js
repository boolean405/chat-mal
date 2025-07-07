import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";

export async function createRedisAdapter() {
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();

  // Wait until connected
  await Promise.all([
    new Promise((res) => pubClient.once("ready", res)),
    new Promise((res) => subClient.once("ready", res)),
  ]);

  return createAdapter(pubClient, subClient);
}
