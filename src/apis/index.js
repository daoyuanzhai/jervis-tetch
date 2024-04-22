import { Hono } from "hono";
import { uploadFile } from "./services/fileUploadService";
import { sendMessage } from "./services/rabbitMQService";
import { jwtMiddleware, generateToken } from "./middlewares/auth";
import { config } from "dotenv";

config();
const RABBITMQ_USER = process.env.RABBITMQ_DEFAULT_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_DEFAULT_PASS;

const app = new Hono();

async function handleSubmission(formData, c) {
  const message = {
    app_id: formData.get("app_id"),
    user_id: formData.get("user_id"),
    conversation_id: formData.get("conversation_id"),
  };

  if (!message.app_id || !message.user_id || !message.conversation_id) {
    console.error("Error: Missing required form parameters");
    return c.json(
      {
        status: "error",
        message:
          "One or more required form parameters are missing or incorrect.",
      },
      400
    );
  }

  const file = formData.get("file");
  const text = formData.get("text");
  if (!file && !text) {
    console.error("Error: Neither file nor text is provided in the request");
    return c.json(
      {
        status: "error",
        message: "Neither a file nor text is provided.",
      },
      400
    );
  }

  if (file) {
    try {
      const filename = await uploadFile(
        message.app_id,
        message.user_id,
        message.conversation_id,
        file
      );
      message.filename = filename;
    } catch (error) {
      console.error(`Failed to upload file: ${error}`);
      return c.json({ status: "error", message: error.message }, 500);
    }
  } else {
    message.text = text;
  }

  sendMessage("inferer-request-queue", message);
  return c.json({ status: "success", sent: message });
}

app.post("/submit", jwtMiddleware, async (c) => {
  const formData = await c.req.formData();
  return await handleSubmission(formData, c);
});

app.post("/token", async (c) => {
  const { username, password } = await c.req.json();
  if (username === RABBITMQ_USER && password === RABBITMQ_PASSWORD) {
    const token = generateToken({ username });
    return c.json({ token });
  }
  return c.json({ status: "error", message: "invalid credential" }, 401);
});

export default app;
