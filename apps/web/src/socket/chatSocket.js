import { io } from "socket.io-client";
import { SOCKET_URL } from "@shared/constants/urls.js";
import { getToken } from "../services/auth/authService.js";

let chatSocket = null;

export const getChatSocket = () => {
  if (!chatSocket) {
    chatSocket = io(`${SOCKET_URL}/chat`, {
      autoConnect: false,
      auth: { token: getToken() },
    });
  }
  return chatSocket;
};

export const resetChatSocket = () => {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
};
