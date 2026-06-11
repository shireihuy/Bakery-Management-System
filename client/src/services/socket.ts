import { io, Socket } from "socket.io-client";

import { BASE_URL } from "../config/api";

const SOCKET_URL = BASE_URL;

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    if (this.socket) {
      this.socket.auth = { token: localStorage.getItem("token") };
      this.socket.connect();
      return;
    }

    const token = localStorage.getItem("token");
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      auth: { token }
    });

    this.socket.on("connect", () => {
      this.joinUserRoom();
    });

    this.socket.on("disconnect", () => {});
  }

  reconnect() {
    if (this.socket) {
      this.socket.auth = { token: localStorage.getItem("token") };
      this.socket.disconnect();
      this.socket.connect();
      return;
    }

    this.connect();
  }

  joinUserRoom() {
    if (!this.socket) this.connect();

    const storedUser = localStorage.getItem("user");
    if (storedUser && this.socket) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id) {
          this.socket.emit("join:user");
        }
      } catch (err) {
        console.error("Failed to parse user for socket room:", err);
      }
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    if (!this.socket) this.connect();
    this.socket?.emit(event, data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
