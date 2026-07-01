import { Server } from "socket.io";
import initChatSocket from "../../../../modules/chat/chat.socket.js";
import initPresenceSocket from "../../../../modules/presence/presence.socket.js";
import initCallSocket from "../../../../modules/call/call.socket.js";
import initActivitySocket from "../../../../modules/sync/activity.socket.js";
import initNotificationSocket from "../../../../modules/notification/notification.socket.js";
import initGameSocket from "../../../../modules/games/game.socket.js";

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout:  20000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
    transports: ["polling", "websocket"],
    connectTimeout: 10000,
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
    });
  });

  initChatSocket(io);
  initPresenceSocket(io);
  initCallSocket(io);
  initActivitySocket(io);
  initNotificationSocket(io);
  initGameSocket(io);

  return io;
};

export default initSocket;
