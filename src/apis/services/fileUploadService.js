import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";

async function uploadFile(app_id, user_id, conversation_id, file) {
  const uploadPath = join(
    process.cwd(),
    "uploads",
    app_id,
    user_id,
    conversation_id
  );
  if (!existsSync(uploadPath)) {
    console.log(`Creating new directory at ${uploadPath}`);
    mkdirSync(uploadPath, { recursive: true });
  }

  const filename = Date.now() + "-" + file.name;
  const buffer = await file.arrayBuffer();
  const filepath = join(uploadPath, filename);

  console.log(`Writing file to ${filepath}`);
  await writeFile(filepath, Buffer.from(buffer));
  console.log("File upload successful");
  return filename;
}

export { uploadFile };
