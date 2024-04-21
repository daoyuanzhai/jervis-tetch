import "reflect-metadata";

import express, { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { SendMessageRequest } from "../models/dto";
import { sendMessage } from "./rabbitMQService";

import multer from 'multer';
import dotenv from "dotenv";

dotenv.config();
const port: number = Number(process.env.EXPRESS_PORT);

// Middleware for automatic validation
function validationMiddleware<T>(type: any): express.RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = await validate(plainToInstance(type, req.body));
    if (validationResult.length > 0) {
      res.status(400).json(validationResult);
    } else {
      next();
    }
  };
}

const app = express();
app.use(express.json());

// Health Check Endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "up" });
});

app.post(
  "/send",
  validationMiddleware(SendMessageRequest),
  async (req, res) => {
    const { queue, message } = req.body;

    try {
      await sendMessage(queue, message);
      res
        .status(200)
        .json({ message: `Message sent successfully to queue: ${queue}.` });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: `Failed to send message to queue: ${queue}.` });
    }
  }
);

app.post('/upload', (req: Request, res: Response, next: NextFunction) => {
  // Ensure field names are specified and are strings
  const app_id = req.query.app_id;
  const user_id = req.query.user_id;
  const conversation_id = req.query.conversation_id;

  // Check if required text fields are received
  if (!app_id || !user_id || !conversation_id) {
    return res.status(400).send('Missing one or more required text fields: app_id, user_id, or conversation_id.');
  }

  const dynamicUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, 'uploads/'),
      filename: (req, file, cb) => cb(null, conversation_id + '-' + Date.now() + '.mp3')
    })
  }).single("file");

  dynamicUpload(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, (req: Request, res: Response) => {
  if (req.file) {
    res.json({
      message: 'File uploaded successfully!',
      filename: req.file.filename
    });
  } else {
    res.status(400).send('No file uploaded.');
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
