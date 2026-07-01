import { io } from "socket.io-client";
import { SOCKET_URL } from "@shared/constants/urls.js";
import { getToken } from "../services/auth/authService.js";

let activitySocket = null;

export const getActivitySocket = () => {
  if (!activitySocket) {
    activitySocket = io(`${SOCKET_URL}/activity`, {
      autoConnect: false,
      auth: { token: getToken() },
    });
  }
  return activitySocket;
};

export const resetActivitySocket = () => {
  if (activitySocket) { activitySocket.disconnect(); activitySocket = null; }
};
