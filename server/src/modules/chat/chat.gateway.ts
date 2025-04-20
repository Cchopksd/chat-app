import { WebSocket, WebSocketServer } from "ws";
import { RoomManager, Client } from "../../sockets/room.manager";
import { logger } from "../../shared/logger/logger";
import { Server } from "http";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { HydratedDocument } from "mongoose";
import { IUser } from "../user/user.model";

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface JoinPayload {
  userId: string;
  roomId: string;
}

export class WebSocketGateway {
  private wss: WebSocketServer;
  private roomManager: RoomManager;
  private heartbeatInterval!: NodeJS.Timeout;

  constructor(server: Server, private readonly rabbitClient: RabbitMQClient) {
    this.wss = new WebSocketServer({ server });
    this.roomManager = new RoomManager();

    this.startHeartbeat();
    this.setupRabbitSubscription();
    this.setupErrorHandling();
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  private setupRabbitSubscription() {
    this.rabbitClient.subscribe(
      "chat_exchange",
      "new_message_queue",
      "room.*",
      async (msg) => {
        try {
          const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;
          const { roomId, message } = parsed;

          if (!roomId || !message) {
            throw new Error("Invalid message format from RabbitMQ");
          }

          this.roomManager.broadcast(roomId, {
            type: "new_message",
            payload: message,
          });
        } catch (err) {
          logger.error("❌ Failed to handle RabbitMQ message:", err);
        }
      }
    );
  }

  private setupErrorHandling() {
    this.wss.on("error", (error) => {
      logger.error("❌ WebSocket server error:", error);
    });

    process.on("SIGTERM", () => this.shutdown());
    process.on("SIGINT", () => this.shutdown());
  }

  private shutdown() {
    this.stopHeartbeat();
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    this.wss.close();
  }

  private handleJoin(socket: WebSocket, payload: JoinPayload): Client {
    const currentUser: Client = {
      id: payload.userId,
      roomId: payload.roomId,
      socket,
    };

    this.roomManager.addClient(payload.roomId, currentUser);

    this.roomManager.broadcast(
      payload.roomId,
      {
        type: "user_joined",
        payload: { userId: payload.userId },
      },
      socket
    );

    return currentUser;
  }

  private handleTypingEvent(
    currentUser: Client,
    type: "typing" | "stop_typing",
    socket: WebSocket
  ) {
    this.roomManager.broadcast(
      currentUser.roomId,
      {
        type,
        payload: { userId: currentUser.id },
      },
      socket
    );
  }

  public start() {
    console.info("🟢 WebSocket server started and waiting for connections...");

    this.wss.on("connection", (socket: WebSocket) => {
      let currentUser: Client | null = null;
      console.info("🔌 New WebSocket connection established");

      socket.on("message", async (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          console.log(message);
          if (!message.type || !message.payload) {
            throw new Error("Invalid message format");
          }

          switch (message.type) {
            case "join":
              currentUser = this.handleJoin(
                socket,
                message.payload as JoinPayload
              );
              break;

            case "typing":
            case "stop_typing":
              if (!currentUser) return;
              this.handleTypingEvent(currentUser, message.type, socket);
              break;

            default:
              logger.warn(`Unknown message type: ${message.type}`);
          }
        } catch (err) {
          logger.error("❌ Error handling WebSocket message:", err);
          socket.send(
            JSON.stringify({
              type: "error",
              payload: "Invalid message format",
            })
          );
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

      socket.on("error", (error) => {
        logger.error("❌ WebSocket client error:", error);
      });
    });
  }
}
