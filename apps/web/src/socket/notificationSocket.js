import { io } from "socket.io-client";
import { SOCKET_URL } from "@shared/constants/urls.js";
import { getToken } from "../services/auth/authService.js";

let notifSocket = null;

export const getNotificationSocket = () => {
  if (!notifSocket) {
    notifSocket = io(`${SOCKET_URL}/notification`, {
      autoConnect: false,
      auth: { token: getToken() },
    });
  }
  return notifSocket;
};

export const resetNotificationSocket = () => {
  if (notifSocket) { notifSocket.disconnect(); notifSocket = null; }
};
