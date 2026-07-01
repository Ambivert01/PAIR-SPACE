import { io } from "socket.io-client";
import { SOCKET_URL } from "@shared/constants/urls.js";
import { getToken } from "../services/auth/authService.js";

let presenceSocket = null;

export const getPresenceSocket = () => {
  if (!presenceSocket) {
    presenceSocket = io(`${SOCKET_URL}/presence`, {
      autoConnect: false,
      auth: { token: getToken() },
    });
  }
  return presenceSocket;
};

export const resetPresenceSocket = () => {
  if (presenceSocket) {
    presenceSocket.disconnect();
    presenceSocket = null;
  }
};
