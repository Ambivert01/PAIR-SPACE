import { io } from "socket.io-client";
import { SOCKET_URL } from "@shared/constants/urls.js";
import { getToken } from "../services/auth/authService.js";

let callSocket = null;

export const getCallSocket = () => {
  if (!callSocket) {
    callSocket = io(`${SOCKET_URL}/call`, {
      autoConnect: false,
      auth: { token: getToken() },
    });
  }
  return callSocket;
};

export const resetCallSocket = () => {
  if (callSocket) { callSocket.disconnect(); callSocket = null; }
};
