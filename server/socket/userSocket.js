// const PREFIX = "user:";

// export const addUserSocket = async (redis, userId, socketId) => {
//   await redis.sadd(`${PREFIX}${userId}`, socketId);
// };

// export const removeUserSocket = async (redis, userId, socketId) => {
//   await redis.srem(`${PREFIX}${userId}`, socketId);
//   const remaining = await redis.scard(`${PREFIX}${userId}`);
//   if (remaining === 0) {
//     await redis.del(`${PREFIX}${userId}`);
//   }
// };

// export const getUserSockets = async (redis, userId) => {
//   return await redis.smembers(`${PREFIX}${userId}`);
// };
