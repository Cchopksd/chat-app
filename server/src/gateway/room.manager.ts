import { WebSocket } from "ws";

export interface Client {
  id: string;
  roomId: string;
  socket: WebSocket;
}

export class RoomManager {
  private rooms: Record<string, Client[]> = {};

  public addClient(roomId: string, client: Client) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [];
    }
    this.rooms[roomId].push(client);
  }

  public removeClient(client: Client) {
    const room = this.rooms[client.roomId];
    if (!room) return;

    this.rooms[client.roomId] = room.filter((c) => c.socket !== client.socket);
  }

  public broadcast(roomId: string, message: any, excludeSocket?: WebSocket) {
    const room = this.rooms[roomId];
    if (!room) return;

    const messageString = JSON.stringify(message);
    room.forEach((client) => {
      if (excludeSocket && client.socket !== excludeSocket) {
        client.socket.send(messageString);
      }
    });
  }

  public getClients(roomId: string): Client[] {
    return this.rooms[roomId] || [];
  }
}

