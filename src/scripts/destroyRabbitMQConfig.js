import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
const RABBITMQ_USER = process.env.RABBITMQ_DEFAULT_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_DEFAULT_PASS;

const axiosInstance = axios.create({
  baseURL: `http://${RABBITMQ_HOST}:15672/api`,
  auth: {
    username: RABBITMQ_USER,
    password: RABBITMQ_PASSWORD,
  },
});

async function deleteAllQueues() {
  try {
    const { data: queues } = await axiosInstance.get(`/queues/%2F`);
    for (const queue of queues) {
      await axiosInstance.delete(
        `/queues/%2F/${encodeURIComponent(queue.name)}`
      );
      console.log(`Queue deleted: ${queue.name}`);
    }
  } catch (error) {
    console.error("Failed to delete queues:", error);
  }
}

async function deleteAllExchanges() {
  try {
    const { data: exchanges } = await axiosInstance.get(`/exchanges/%2F`);
    for (const exchange of exchanges) {
      // Skip default exchanges and any predefined exchanges starting with 'amq.'
      if (exchange.name !== "" && !exchange.name.startsWith("amq.")) {
        await axiosInstance.delete(
          `/exchanges/%2F/${encodeURIComponent(exchange.name)}`
        );
        console.log(`Exchange deleted: ${exchange.name}`);
      }
    }
  } catch (error) {
    console.error("Failed to delete exchanges:", error);
  }
}

async function teardownRabbitMQ() {
  await deleteAllQueues();
  await deleteAllExchanges();
  console.log("Teardown completed successfully.");
}

teardownRabbitMQ().catch(console.error);
