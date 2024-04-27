import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";

function ensureDirectoryExists(path) {
  if (!existsSync(path)) {
    console.log(`Creating new directory at ${path}`);
    mkdirSync(path, { recursive: true });
  }
}

async function uploadFile(app_id, user_id, conversation_id, file) {
  const baseDir = process.cwd();
  const uploadPath = join(baseDir, "uploads", app_id, user_id, conversation_id);
  ensureDirectoryExists(uploadPath);

  const filename = Date.now() + "-" + file.name;
  const buffer = await file.arrayBuffer();
  const filepath = join(uploadPath, filename);

  console.log(`Writing file to ${filepath}`);
  await writeFile(filepath, Buffer.from(buffer));
  console.log("File upload successful");
  return filename;
}

function validateRequiredFields(fields) {
  const missingFields = ["app_id", "user_id", "conversation_id"].filter(
    (key) => !fields[key]
  );
  if (missingFields.length) {
    throw new Error(
      `Missing form parameters: ${missingFields.join(", ")} are all required.`
    );
  }
}

function validateFile(file) {
  const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Unsupported file type: ${file.type}. Only audio files are accepted.`
    );
  }
}

async function uploadFileAndPrepMessage(formData) {
  const message = {
    app_id: formData.get("appId"),
    user_id: formData.get("userId"),
    conversation_id: formData.get("conversationId"),
  };
  validateRequiredFields(message);

  const text = formData.get("text");
  const file = formData.get("file");
  if (!file && !text) {
    throw new Error("You need to provide either a file or a text.");
  }

  if (file) {
    validateFile(file);
    message.filename = await uploadFile(
      message.app_id,
      message.user_id,
      message.conversation_id,
      file
    );
  } else {
    message.text = text;
  }

  return message;
}

export { uploadFileAndPrepMessage };
