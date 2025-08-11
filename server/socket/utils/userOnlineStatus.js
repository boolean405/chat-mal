import UserDB from "../../models/user.js";

export async function markUserOnline(userId) {
  await UserDB.updateOne(
    { _id: userId },
    {
      $set: { isOnline: true },
      // don't touch lastOnlineAt here; only when going offline
    }
  );
}

export async function markUserOffline(userId) {
  await UserDB.updateOne(
    { _id: userId },
    {
      $set: { isOnline: false },
      $currentDate: { lastOnlineAt: true }, // stamp the moment they were last seen
    }
  );
}
