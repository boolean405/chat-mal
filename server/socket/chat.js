import UserDB from "../models/user.js";
import MessageDB from "../models/message.js";
import UnreadDB from "../models/unread.js";
import { validateMessage } from "../utils/validator.js";
import { MessageSchema } from "../utils/schema.js";

// In-memory store for active users
const memoryStore = new Map();

// Socket Initialization
export const initialize = async (io, socket) => {
  socket.currentUserId = socket.user._id;

  await registerLiveUser(socket.id, socket.user);

  socket.on("message", (data) => handleIncomingMessage(io, socket, data));
  socket.on("unreads", () => handleLoadUnreads(socket));
  socket.on("messages", (data) => handleLoadMessages(socket, data));
};

// Register user as live
const registerLiveUser = async (socketId, user) => {
  user.socketId = socketId;
  memoryStore.set(socketId, user._id);
  memoryStore.set(user._id, user);
};

// Handle incoming chat message
const handleIncomingMessage = async (io, socket, data) => {
  const { valid, error, value } = validateMessage(MessageSchema.message, {
    ...data,
    sender: socket.currentUserId.toString(),
  });

  if (!valid) {
    return socket.emit("message", { status: false, message: error });
  }

  try {
    const savedMessage = await MessageDB.create(value);

    const dbMessage = await MessageDB.findById(savedMessage._id).populate(
      "sender receiver",
      "name _id"
    );

    // Emit to receiver via namespace
    io.to(value.receiver).emit("message", dbMessage);

    const receiver = memoryStore.get(dbMessage.receiver._id);

    if (receiver) {
      const receiverSocket = io.of("api/chat").to(receiver.socketId);
      if (receiverSocket) {
        receiverSocket.emit("message", dbMessage);
      } else {
        socket.emit("message", {
          status: false,
          message: "Receiver socket not found!",
        });
      }
    } else {
      // Store as unread if user is not online
      await UnreadDB.create({
        sender: dbMessage.sender._id,
        receiver: dbMessage.receiver._id,
      });
    }

    socket.emit("message", dbMessage);
  } catch (err) {
    console.error("Message saving failed:", err);
    socket.emit("message", {
      status: false,
      message: err.message || "Failed to send message!",
    });
  }
};

// Load unread messages for current user
const handleLoadUnreads = async (socket) => {
  try {
    const unreads = await UnreadDB.find({ receiver: socket.currentUserId });

    if (unreads.length > 0) {
      const unreadIds = unreads.map((item) => item._id);
      await UnreadDB.deleteMany({ _id: { $in: unreadIds } });
    }

    socket.emit("unreads", {
      status: true,
      message: "Unread message count",
      unreads: unreads.length,
    });
  } catch (err) {
    console.error("Error loading unreads:", err);
    socket.emit("unreads", {
      status: false,
      message: "Failed to load unreads",
      unreads: 0,
    });
  }
};

// Load messages with pagination
const handleLoadMessages = async (socket, data) => {
  try {
    const pageNum = Number(data.pageNum);

    if (!pageNum || isNaN(pageNum)) {
      return socket.emit("error", {
        status: false,
        message: "A valid page number must be provided.",
      });
    }

    if (pageNum <= 0) {
      return socket.emit("messages", {
        status: false,
        message: "Page number must be greater than 0.",
      });
    }

    const limit = Number(process.env.PAGINATE_LIMIT) || 20;
    const skip = (pageNum - 1) * limit;

    const userFilter = {
      $or: [
        { sender: socket.currentUserId },
        { receiver: socket.currentUserId },
      ],
    };

    const totalMessages = await MessageDB.countDocuments(userFilter);

    const messages = await MessageDB.find(userFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender receiver", "name _id");

    socket.emit("messages", {
      status: true,
      message: `${
        messages.length
      } messages loaded out of ${totalMessages} for '${
        socket.user?.name || "User"
      }'. Showing ${limit} per page.`,
      messages,
    });
  } catch (err) {
    console.error("Error loading messages:", err);
    socket.emit("messages", {
      status: false,
      message: "An error occurred while loading messages.",
    });
  }
};
