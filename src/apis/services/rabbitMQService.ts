import { MessageContent } from "../models/dto";
import rabbitMQClient from "../clients/rabbitMQClient";
import { sanitize } from "../sanitizer";

export async function sendMessage(
  queue: string,
  message: MessageContent
): Promise<void> {
  await rabbitMQClient.connect();
  const success = await rabbitMQClient.sendMessage(queue, message);
  const sanitizedMessage = sanitize(message, "MessageContent");
  if (success) {
    console.log(
      `Message sent successfully to queue: ${queue}. Message:`,
      sanitizedMessage
    );
  } else {
    console.error(
      `Failed to send message to queue: ${queue}. Message:`,
      sanitizedMessage
    );
  }
}
