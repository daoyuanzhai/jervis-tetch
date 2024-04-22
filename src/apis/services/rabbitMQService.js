import { rabbitMQClient } from "../clients/rabbitMQClient";

async function sendMessage(queue, message) {
  try {
    await rabbitMQClient.connect();
    await rabbitMQClient.sendMessage(queue, message);
  } finally {
    await rabbitMQClient.close(); // Ensure the connection is closed whether the message send was successful or not
  }
}

export { sendMessage };
