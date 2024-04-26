import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";

// Helper function to ensure directory existence
function ensureDirectoryExists(path) {
  if (!existsSync(path)) {
    console.log(`Creating new directory at ${path}`);
    mkdirSync(path, { recursive: true });
  }
}

async function uploadFile(app_id, user_id, conversation_id, file) {
  const baseDir = process.cwd();
  const uploadPath = join(baseDir, "uploads", app_id, user_id, conversation_id);
  const localUploadPath = join(
    baseDir,
    "uploads_local",
    app_id,
    user_id,
    conversation_id
  );

  // Ensure both directories exist
  ensureDirectoryExists(uploadPath);
  ensureDirectoryExists(localUploadPath);

  const filename = Date.now() + "-" + file.name;
  const buffer = await file.arrayBuffer();
  const filepath = join(uploadPath, filename);
  const localFilepath = join(localUploadPath, filename);

  // Write file to both directories
  console.log(`Writing file to ${filepath}`);
  await writeFile(filepath, Buffer.from(buffer));
  console.log(`Writing file to ${localFilepath}`);
  await writeFile(localFilepath, Buffer.from(buffer));

  console.log("File upload successful");
  return filename;
}

export { uploadFile };
