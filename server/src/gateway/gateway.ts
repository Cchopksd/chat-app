import { WebSocket, WebSocketServer } from "ws";
import { RoomManager } from "./room.manager";
import { logger } from "../shared/logger/logger";
import { Client } from "./room.manager";

export class WebSocketGateway {
  private wss: WebSocketServer;
  private roomManager: RoomManager;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.roomManager = new RoomManager();
  }

  public start() {
    this.wss.on("connection", (socket: WebSocket) => {
      let currentUser: Client | null = null;

      socket.on("message", (data) => {
        try {
          const { type, payload } = JSON.parse(data.toString());

          switch (type) {
            case "join":
              currentUser = {
                id: payload.userId,
                roomId: payload.roomId,
                socket,
              };
              this.roomManager.addClient(payload.roomId, currentUser);
              this.roomManager.broadcast(payload.roomId, {
                type: "user_joined",
                payload: { userId: payload.userId },
              });
              break;

            case "message":
              if (!currentUser) return;
              this.roomManager.broadcast(currentUser.roomId, {
                type: "message",
                payload: {
                  userId: currentUser.id,
                  message: payload.message,
                },
              });
              break;

            case "typing":
              if (!currentUser) return;
              this.roomManager.broadcast(
                currentUser.roomId,
                {
                  type: "typing",
                  payload: { userId: currentUser.id },
                },
                socket
              );
              break;

            case "stop_typing":
              if (!currentUser) return;
              this.roomManager.broadcast(
                currentUser.roomId,
                {
                  type: "stop_typing",
                  payload: { userId: currentUser.id },
                },
                socket
              );
              break;
          }
        } catch (err) {
          logger.error("WebSocket message parse error", err);
        }
      });

      socket.on("close", () => {
        if (currentUser) {
          this.roomManager.removeClient(currentUser);
          this.roomManager.broadcast(currentUser.roomId, {
            type: "user_left",
            payload: { userId: currentUser.id },
          });
        }
      });
    });
  }
}

