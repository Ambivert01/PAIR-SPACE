import { io } from "socket.io-client";
import { SOCKET_URL } from "@shared/constants/urls.js";
import { getToken } from "../services/auth/authService.js";

let gameSocket = null;

export const getGameSocket = () => {
  if (!gameSocket) {
    gameSocket = io(`${SOCKET_URL}/game`, {
      autoConnect: false,
      auth: { token: getToken() },
    });
  }
  return gameSocket;
};

export const resetGameSocket = () => {
  if (gameSocket) { gameSocket.disconnect(); gameSocket = null; }
};
