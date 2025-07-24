export default function registerCallHandlers(socket, io) {
  socket.on("call-chat", ({ chatId, offer }) => {
    // Broadcast offer to other users in the chat room except sender
    socket.to(chatId).emit("call-chat", { offer, from: socket.id });
  });

  socket.on("call-chat-answer", ({ chatId, answer }) => {
    socket.to(chatId).emit("call-chat-answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ chatId, candidate }) => {
    socket.to(chatId).emit("ice-candidate", { candidate, from: socket.id });
  });
}
