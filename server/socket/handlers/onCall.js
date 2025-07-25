export default function registerCallHandlers(socket, io) {
  socket.on("offer", (chatId, payload) => {
    socket.to(chatId).emit("offer", { sdp: payload.sdp, from: socket.id });
  });

  socket.on("answer", (chatId, payload) => {
    socket.to(chatId).emit("answer", { sdp: payload.sdp, from: socket.id });
  });

  socket.on("ice-candidate", (chatId, payload) => {
    socket
      .to(chatId)
      .emit("ice-candidate", { candidate: payload.candidate, from: socket.id });
  });
}
