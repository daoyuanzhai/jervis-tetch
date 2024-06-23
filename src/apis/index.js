import { Hono } from "hono";
import { readFile } from "fs/promises";
import { uploadFileAndPrepMessage } from "./services/submissionService";
import {
  setContext,
  getPresetContexts,
  getContextById,
} from "./services/contextService";
import { jwtMiddleware, generateToken } from "./middlewares/auth";
import { hashPassword } from "./utils/utils";
import { sendCeleryMessage } from "./services/celeryService";

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

app.post("/preset/context", jwtMiddleware, async (c) => {
  const jsonData = await c.req.json();
  const { appId, tags, systemContext } = jsonData;

  try {
    await setContext(appId, "preset", tags, systemContext);
    return c.json({ status: "success" });
  } catch (error) {
    console.error("Failed to set context:", error);
    return c.json(
      {
        status: "error",
        message: "Failed to set context: " + error.message,
      },
      500
    );
  }
});

app.get("/presets", jwtMiddleware, async (c) => {
  try {
    const presetContexts = await getPresetContexts();

    const transformedContexts = presetContexts.map((context) => ({
      id: context.id,
      app_id: context.app_id,
      type: context.user_id,
      tags: context.conversation_id,
      system_context: context.system_context,
      modified_at: context.modified_at,
    }));

    return c.json({ status: "success", data: transformedContexts });
  } catch (error) {
    console.error("Failed to get preset contexts:", error);
    return c.json(
      {
        status: "error",
        message: "Failed to get preset contexts: " + error.message,
      },
      500
    );
  }
});

app.get("/preset/:id", jwtMiddleware, async (c) => {
  const { id } = c.req.param();

  try {
    const context = await getContextById(id);

    const transformedContext = {
      id: context.id,
      app_id: context.app_id,
      type: context.user_id,
      tags: context.conversation_id,
      system_context: context.system_context,
      modified_at: context.modified_at,
    };

    return c.json({ status: "success", data: transformedContext });
  } catch (error) {
    console.error(`Failed to get context with id ${id}:`, error);
    return c.json(
      {
        status: "error",
        message: `Failed to get context with id ${id}: ` + error.message,
      },
      500
    );
  }
});

app.post("/chat/context", jwtMiddleware, async (c) => {
  const jsonData = await c.req.json();
  const { appId, userId, conversationId, presetId } = jsonData;
  let systemContext = jsonData.systemContext;

  try {
    if (presetId != null) {
      const context = await getContextById(presetId);
      systemContext = context.system_context;
    }
    const conversation_id = await setContext(
      appId,
      userId,
      conversationId,
      systemContext
    );
    return c.json({ status: "success", conversationId: conversation_id });
  } catch (error) {
    console.error("Failed to set context:", error);
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
    await sendCeleryMessage("celery", {
      task: "celery_config.process_message",
      args: [message],
      kwargs: {},
    });
    return c.json({ status: "success", sent: message });
  } catch (error) {
    return c.json(
      {
        status: "error",
        message: "Failed to submit chat request: " + error.message,
      },
      500
    );
  }
});

export default app;
