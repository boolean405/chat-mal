// config/socket.js
let ioInstance;

export const initSocket = (serverIO) => {
  ioInstance = serverIO;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
};
