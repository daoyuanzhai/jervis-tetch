import { Client } from "minio";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";

config();

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

async function uploadFileToMinIO(app_id, user_id, conversation_id, file) {
  const bucketName = process.env.MINIO_BUCKET;
  const objectName = `${app_id}/${user_id}/${conversation_id}/${uuidv4()}-${
    file.name
  }`;

  const buffer = await file.arrayBuffer();
  const fileStream = Buffer.from(buffer);

  await minioClient.putObject(bucketName, objectName, fileStream);

  return objectName;
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
    voice_model: formData.get("voiceModel"),
  };
  validateRequiredFields(message);

  const text = formData.get("text");
  const file = formData.get("file");
  if (!file && !text) {
    throw new Error("You need to provide either a file or a text.");
  }

  if (file) {
    validateFile(file);
    message.filename = await uploadFileToMinIO(
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

async function retrieveTtsFile(filename) {
  try {
    const bucketName = process.env.MINIO_BUCKET_TTS;
    // Get the file
    const fileStream = await minioClient.getObject(bucketName, filename);

    // Read the file content
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileContent = Buffer.concat(chunks);

    // console.log("File content:", fileContent.toString());

    // Remove the file
    minioClient.removeObject(bucketName, filename);
    console.log("File removed successfully");

    return fileContent;
  } catch (error) {
    console.error("Error handling file:", error);
  }
}

export { uploadFileAndPrepMessage, retrieveTtsFile };
