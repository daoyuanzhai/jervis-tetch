import { Hono } from "hono";
import dotenv from "dotenv";
import { uploadFile } from "./services/fileUploadService";
import { sendMessage } from "./services/rabbitMQService";

dotenv.config();
// const port = process.env.HONO_PORT;

const app = new Hono();

app.post("/submit", async (c) => {
  const app_id = c.req.query("app_id");
  const user_id = c.req.query("user_id");
  const conversation_id = c.req.query("conversation_id");

  if (!app_id || !user_id || !conversation_id) {
    console.error("Error: Missing required query parameters");
    return c.json(
      {
        status: "error",
        message:
          "One or more required query parameters are missing or incorrect. Ensure that app_id, user_id, and conversation_id are provided and are strings.",
      },
      400
    );
  }
  console.log(
    `Received submission with app_id: ${app_id}, user_id: ${user_id}, conversation_id: ${conversation_id}`
  );

  try {
    const formData = await c.req.formData();
    const filename = await uploadFile(
      app_id,
      user_id,
      conversation_id,
      formData
    );
    sendMessage("inferer-request-queue", {
      app_id,
      user_id,
      conversation_id,
      filename,
    });
    return c.json({ status: "success", filename });
  } catch (error) {
    console.error(`Failed to write file: ${error}`);
    return c.json({ status: "error", message: error.message }, 500);
  }
});

export default app;
