import { Hono } from "hono";
import { readFile } from "fs/promises";
import { uploadFileAndPrepMessage } from "./services/submissionService";
import { sendMessage } from "./services/rabbitMQService";
import { setContext } from "./services/lagoService";
import { jwtMiddleware, generateToken } from "./middlewares/auth";
import { hashPassword } from "./utils/utils";

const app = new Hono();

app.post("/token", async (c) => {
  const { username, password } = await c.req.json();
  try {
    const data = await readFile("credentials.json", "utf8");
    const users = JSON.parse(data);

    const user = users.find((user) => user.username === username);

    if (user && user.password === hashPassword(password)) {
      const token = generateToken({ username });
      return c.json({ token });
    } else {
      return c.json({ status: "error", message: "invalid credentials" }, 401);
    }
  } catch (error) {
    console.error("Error reading from credentials.json:", error);
    return c.json({ status: "error", message: "server error" }, 500);
  }
});

app.post("/chat/context", jwtMiddleware, async (c) => {
  const jsonData = await c.req.json();

  try {
    const conversationId = await setContext(
      jsonData.appId,
      jsonData.userId,
      jsonData.conversationId,
      jsonData.systemContext
    );
    return c.json({ status: "success", conversationId });
  } catch (error) {
    return c.json(
      {
        status: "error",
        message: "Failed to set context: " + error.message,
      },
      500
    );
  }
});

app.post("/submit", jwtMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const message = await uploadFileAndPrepMessage(formData);
    sendMessage("inferer-request-queue", message);
    return c.json({ status: "success", sent: message });
  } catch (error) {
    return c.json(
      {
        status: "error",
        message: "Failed to set context: " + error.message,
      },
      500
    );
  }
});

export default app;
