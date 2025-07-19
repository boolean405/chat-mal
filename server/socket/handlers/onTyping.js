// /socket/handlers/onTyping.js

export default function onTyping(socket, io, { chatId, user }, isTyping) {
  const event = isTyping ? "typing" : "stop-typing";
  socket.to(chatId).emit(event, { chatId, user });
}
