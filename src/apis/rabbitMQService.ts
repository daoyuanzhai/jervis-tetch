import { connect } from 'amqplib';

const amqpURL = 'amqp://user:password@localhost'; // Adjust as needed

export async function sendMessage(queue: string, message: object): Promise<void> {
    const conn = await connect(amqpURL);
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    await channel.close();
    await conn.close();
}
