import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/connectDB.js";
import { Migrator } from "./migrations/migrator.js";
import connectSocket from "./config/connectSocket.js";

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

// Connect to MongoDB
connectDB();

mongoose.connection.once("open", () => {
  server.listen(port, async () => {
    console.log(`=> ✅ Server running on port ${port}`);
    await Migrator.migrate();
    await Migrator.backup();
  });
});

// Setup socket
connectSocket(io);
