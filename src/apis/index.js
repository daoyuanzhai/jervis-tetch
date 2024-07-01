import { Hono } from "hono";
const path = require("path");
import { readFile } from "fs/promises";
import {
  uploadFileAndPrepMessage,
  retrieveTtsFile,
} from "./services/submissionService";
import {
  setContext,
  getPresetContexts,
  getContextById,
} from "./services/contextService";
import { jwtMiddleware, generateToken } from "./middlewares/auth";
import { hashPassword } from "./utils/utils";
import { sendCeleryMessage } from "./services/celeryService";
import { fetchCharacterList } from "./clients/ttsClient";

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

app.get("/characters", jwtMiddleware, async (c) => {
  try {
    const characters = await fetchCharacterList();

    return c.json(characters);
  } catch (error) {
    console.error("Failed to get preset contexts:", error);
    return c.json(
      {
        status: "error",
        message: "Failed to get characters: " + error.message,
      },
      500
    );
  }
});

app.get("/get-tts-file/:filename", jwtMiddleware, async (c) => {
  const filename = c.req.param("filename");
  try {
    const fileContent = await retrieveTtsFile(filename);
    const mimeType = getMimeType(filename);
    return c.body(fileContent, 200, { "Content-Type": mimeType });
  } catch (error) {
    console.log(error);
    return c.text("Error retrieving file", 500);
  }
});

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    // Add more cases as needed for different audio formats
    default:
      return "application/octet-stream";
  }
}
export default app;
