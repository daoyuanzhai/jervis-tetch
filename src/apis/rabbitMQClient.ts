// rabbitmqClient.ts
import { connect, Channel, Connection } from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const RABBITMQ_HOST: string = process.env.RABBITMQ_HOST!;
const RABBITMQ_USER: string = process.env.RABBITMQ_DEFAULT_USER!;
const RABBITMQ_PASSWORD: string = process.env.RABBITMQ_DEFAULT_PASS!;
const amqpURL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}`;

class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await connect(amqpURL);
      this.channel = await this.connection.createChannel();
    }
  }

  async sendMessage(queue: string, message: Object): Promise<boolean> {
    if (!this.channel) {
      console.error("RabbitMQ channel is not initialized.");
      return false;
    }
    await this.channel.assertQueue(queue, { durable: true });
    return this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(message))
    );
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}

const rabbitMQClient = new RabbitMQClient();
export default rabbitMQClient;
