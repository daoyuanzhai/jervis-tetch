import axios from "axios";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import dotenv from "dotenv";

dotenv.config();

const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
const RABBITMQ_PORT = process.env.RABBITMQ_PORT;
const RABBITMQ_USER = process.env.RABBITMQ_DEFAULT_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_DEFAULT_PASS;

const auth = {
  username: RABBITMQ_USER,
  password: RABBITMQ_PASSWORD,
};

async function applyConfiguration() {
  try {
    // Load YAML config
    const yamlFilePath = path.join(process.cwd(), "rabbitmq-config.yaml");
    const config = yaml.load(fs.readFileSync(yamlFilePath, "utf8"));

    // Apply Exchanges
    for (const exchange of config.exchanges) {
      await axios.put(
        `http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/api/exchanges/%2F/${exchange.name}`,
        {
          type: exchange.type,
          durable: exchange.durable,
          auto_delete: exchange.auto_delete || false,
          arguments: exchange.arguments || {},
        },
        { auth }
      );
    }

    // Apply Queues
    for (const queue of config.queues) {
      await axios.put(
        `http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/api/queues/%2F/${queue.name}`,
        {
          durable: queue.durable,
          arguments: queue.arguments || {},
        },
        { auth }
      );
    }

    // Apply Bindings
    for (const binding of config.bindings) {
      await axios.post(
        `http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/api/bindings/%2F/e/${binding.exchange}/q/${binding.queue}`,
        {
          routing_key: binding.routing_key,
          arguments: binding.arguments || {},
        },
        { auth }
      );
    }

    console.log("Configuration applied successfully.");
  } catch (error) {
    console.error("Failed to apply configuration:", error);
  }
}

applyConfiguration().catch(console.error);
