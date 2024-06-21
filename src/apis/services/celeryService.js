import amqp from "amqplib";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";

config();

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_API_PORT}`;

export async function sendCeleryMessage(queue, message) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    // Add a unique task_id to the message
    const taskMessage = {
      id: uuidv4(), // Generate a unique ID for the task
      task: message.task,
      args: message.args,
      kwargs: message.kwargs,
    };

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(taskMessage)), {
      contentType: "application/json",
      contentEncoding: "utf-8",
    });

    console.log(
      `Sent message to queue ${queue}: ${JSON.stringify(taskMessage)}`
    );
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error(`Failed to send message to queue ${queue}: ${error.message}`);
  }
}
