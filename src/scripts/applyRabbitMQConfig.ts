import axios from 'axios';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Config } from '../models/rabbitMQ';
import dotenv from 'dotenv';
dotenv.config();

const RABBITMQ_API: string = process.env.RABBITMQ_URL!;
const RABBITMQ_USER: string = process.env.RABBITMQ_DEFAULT_USER!;
const RABBITMQ_PASSWORD: string = process.env.RABBITMQ_DEFAULT_PASS!;

const auth = {
    username: RABBITMQ_USER,
    password: RABBITMQ_PASSWORD,
};

async function applyConfiguration(): Promise<void> {
    try {
        // Load YAML config and cast it to the Config interface
        const yamlFilePath = path.join(process.cwd(), 'rabbitmq-config.yaml');
        const config: Config = yaml.load(fs.readFileSync(yamlFilePath, 'utf8')) as Config;

        // Apply Exchanges
        for (const exchange of config.exchanges) {
            await axios.put(`${RABBITMQ_API}/exchanges/%2F/${exchange.name}`, {
                type: exchange.type,
                durable: exchange.durable,
                auto_delete: exchange.auto_delete || false,
                arguments: exchange.arguments || {}
            }, { auth });
        }

        // Apply Queues
        for (const queue of config.queues) {
            await axios.put(`${RABBITMQ_API}/queues/%2F/${queue.name}`, {
                durable: queue.durable,
                arguments: queue.arguments || {}
            }, { auth });
        }

        // Apply Bindings
        for (const binding of config.bindings) {
            await axios.post(`${RABBITMQ_API}/bindings/%2F/e/${binding.exchange}/q/${binding.queue}`, {
                routing_key: binding.routing_key,
                arguments: binding.arguments || {}
            }, { auth });
        }


        console.log('Configuration applied successfully.');
    } catch (error) {
        console.error('Failed to apply configuration:', error);
    }
}

applyConfiguration();
