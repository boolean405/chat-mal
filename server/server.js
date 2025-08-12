import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/connectDB.js";
import connectSocket from "./socket/index.js";
// import { Migrator } from "./migrations/migrator.js";
import { connectRedis } from "./config/redisClient.js";
import allowedOrigins from "./config/allowedOrigins.js";

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io); // Setup socket
connectSocket(io); // Connet socket
connectDB(); // Connect to MongoDB

// Start function to coordinate server
const startServer = async () => {
  try {
    // Wait for MongoDB connection
    mongoose.connection.once("open", async () => {
      await connectRedis(); // Connect redis

      // Migrations and backups
      // await Migrator.migrate();
      // await Migrator.backup();

      server.listen(port, () => {
        console.log(`=> 🚀 Server running on port ${port}.`);
      });
    });
  } catch (err) {
    console.error("=> ❌ Startup error: ", err.message);
    process.exit(1);
  }
};

startServer(); // Start server
