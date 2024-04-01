import express from 'express';
import { sendMessage } from './rabbitMQService';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port: number = Number(process.env.EXPRESS_PORT);

app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'up' });
});

app.post('/send', async (req, res) => {
    const { queue, message } = req.body;

    try {
        await sendMessage(queue, message);
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
