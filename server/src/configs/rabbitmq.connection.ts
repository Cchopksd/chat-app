// src/configs/RabbitMQService.ts

import amqplib, { Channel, Connection } from "amqplib";
import { RabbitMQClient } from "../shared/rabbitmq/RabbitMQClient";

export class RabbitMQService {
  private connection!: Connection | any;
  private channel!: Channel;
  private client!: RabbitMQClient;

  constructor(private readonly uri: string) {}

  public async connect(): Promise<void> {
    try {
      this.connection = await amqplib.connect(this.uri);
      this.channel = await this.connection.createChannel();
      this.client = new RabbitMQClient(this.channel);

      console.info("✅ Connected to RabbitMQ");
    } catch (error) {
      console.error("❌ Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  public getClient(): RabbitMQClient {
    if (!this.client) {
      throw new Error(
        "RabbitMQClient has not been initialized. Call connect() first."
      );
    }
    return this.client;
  }

  public async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.info("✅ RabbitMQ connection closed");
    } catch (error) {
      console.error("❌ Error closing RabbitMQ connection:", error);
    }
  }
}

