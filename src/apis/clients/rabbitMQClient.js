import { connect } from "amqplib";
import { config } from "dotenv";

config();

const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
const RABBITMQ_USER = process.env.RABBITMQ_DEFAULT_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_DEFAULT_PASS;
const amqpURL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}`;

class RabbitMQClient {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await connect(amqpURL);
      this.channel = await this.connection.createChannel();
      console.log("Connected to RabbitMQ");
      // Proper error handling for unexpected connection close
      this.connection.on("close", (err) => {
        this.connection = null;
        this.channel = null;
        // Reconnect logic can be added here if needed
      });
      // Handling errors
      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error", err);
      });
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error; // Rethrow to let the caller handle it
    }
  }

  async sendMessage(queue, message) {
    if (!this.channel) {
      console.error("RabbitMQ channel is not initialized.");
      return { success: false, error: "Channel is not initialized" };
    }
    try {
      await this.channel.assertQueue(queue, { durable: true });
      const bufferedMessage = Buffer.from(JSON.stringify(message));
      this.channel.sendToQueue(queue, bufferedMessage, { persistent: true });

      let sanitizedMessage = { ...message };
      if (sanitizedMessage.text) {
        sanitizedMessage.text = sanitizedMessage.text.substring(0, 10) + "***";
      }
      console.log(
        `Message sent successfully to queue: ${queue}. Message:`,
        sanitizedMessage
      );
    } catch (error) {
      console.error(`Failed to send message to ${queue}:`, error);
      throw error; // Rethrow to let the caller handle it
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log("RabbitMQ connection closed successfully");
    } catch (error) {
      console.error("Failed to close RabbitMQ connection:", error);
      throw error; // Rethrow to let the caller handle it
    }
  }
}

const rabbitMQClient = new RabbitMQClient();

// Export the client instance
export { rabbitMQClient };
