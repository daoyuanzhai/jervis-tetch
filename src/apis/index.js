import { Hono } from 'hono';
import dotenv from "dotenv";
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

dotenv.config();
// const port = process.env.HONO_PORT;

const app = new Hono()

app.post('/submit', async (c) => {
    const app_id = c.req.query('app_id');
    const user_id = c.req.query('user_id');
    const conversation_id = c.req.query('conversation_id');

    // Logging the initial request data
    console.log(`Received submission with app_id: ${app_id}, user_id: ${user_id}, conversation_id: ${conversation_id}`);

    if (!app_id || !user_id || !conversation_id) {
        console.error("Error: Missing required query parameters");
        return c.json({
            status: "error",
            message: 'One or more required query parameters are missing or incorrect. Ensure that app_id, user_id, and conversation_id are provided and are strings.'
        }, 400);
    }

    const uploadPath = join(process.cwd(), 'uploads', app_id, user_id, conversation_id);
    if (!existsSync(uploadPath)) {
        console.log(`Creating new directory at ${uploadPath}`);
        mkdirSync(uploadPath, { recursive: true });
    }

    const formData = await c.req.formData();
    const file = formData.get("file");
    if (!file) {
        console.error("Error: No file is provided in the request");
        return c.json({ status: "error", message: "No file uploaded." }, 400);
    }

    const filename = Date.now() + '-' + file.name;
    const buffer = await file.arrayBuffer();
    const filepath = join(uploadPath, filename);

    try {
        console.log(`Writing file to ${filepath}`);
        await writeFile(filepath, Buffer.from(buffer));
        console.log("File upload successful");
        return c.json({ status: "success", filename: filename });
    } catch (error) {
        console.error(`Failed to write file: ${error}`);
        return c.json({ status: "error", message: error.message }, 500);
    }
});


export default app