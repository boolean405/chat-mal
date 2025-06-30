import fs from "fs";
import UserDB from "../models/user.js";
import Encoder from "../utils/encoder.js";

export const Migrator = {
  migrate: async () => {
    if (process.env.MIGRATE_ENABLED === "true") {
      const defaultData = fs.readFileSync("./migrations/default_data.json");
      if (!defaultData) {
        console.log("=> Failed Migration, Default data not found!");
        return;
      }
      const data = JSON.parse(defaultData);

      // User Migration
      if (!data.users) {
        console.log("=> Failed user migration, Users not found!");
        return;
      }
      data.users.forEach(async (user) => {
        let existUser = await UserDB.findOne({ username: user.username });
        if (existUser) {
          console.log(
            `=> Skipped migrate, ${user.name} user is already exist.`
          );
          return;
        }
        user.password = Encoder.encode(user.password);
        await UserDB.create(user);
        console.log(`=> Success migrate, ${user.name} User.`);
      });
    }
  },

  backup: async () => {
    if (process.env.BACKUP_ENABLED === "true") {
      const users = await UserDB.find();
      if (!users) return;
      fs.mkdirSync("./migrations/backups", { recursive: true });
      fs.writeFileSync(
        "./migrations/backups/users.json",
        JSON.stringify(users)
      );
      console.log("=> Success backup, Databases backup finished.");
    }
  },
};
