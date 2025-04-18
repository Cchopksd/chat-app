import { WebSocket, WebSocketServer } from "ws";
import { RoomManager } from "../../sockets/room.manager";
import { logger } from "../../shared/logger/logger";
import { Client } from "../../sockets/room.manager";
import { ChatService } from "./chat.service";
import { ChatRepository } from "./chat.repo";
import { Server } from "http";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";

export class WebSocketGateway {
  private wss: WebSocketServer;
  private roomManager: RoomManager;
  private chatService: ChatService;

  private startHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, 30000);
  }

  constructor(server: Server, readonly rabbitClient: RabbitMQClient) {
    this.wss = new WebSocketServer({ server });
    this.roomManager = new RoomManager();
    const chatRepo: ChatRepository = new ChatRepository();
    this.chatService = new ChatService(chatRepo, rabbitClient);

    this.startHeartbeat();
  }

  public start() {
    console.info("🟢 WebSocket server started and waiting for connections...");
    this.wss.on("connection", (socket: WebSocket) => {
      let currentUser: Client | null = null;

      console.info("🔌 New WebSocket connection established");

      socket.on("message", async (data) => {
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

              const saved = await this.chatService.createChat({
                room_id: currentUser.roomId,
                sender_id: currentUser.id,
                content: payload.message,
                message_type: payload.message_type || "text",
              });

              this.roomManager.broadcast(
                currentUser.roomId,
                {
                  type: "message",
                  payload: saved,
                },
                socket // 👈 exclude sender
              );
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
          this.wss.on("error", (error) => {
            console.info("WebSocket server error:", error);
            logger.error("WebSocket server error:", error);
          });
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
