import "reflect-metadata";

import express, { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { SendMessageRequest } from "../models/dto";
import { sendMessage } from "./rabbitMQService";

import multer from 'multer';
import dotenv from "dotenv";

import fs from 'fs';
import path from 'path';

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
  const app_id = req.query.app_id;
  const user_id = req.query.user_id;
  const conversation_id = req.query.conversation_id;

  if (typeof app_id !== 'string' || !app_id ||
      typeof user_id !== 'string' || !user_id ||
      typeof conversation_id !== 'string' || !conversation_id) {
    return res.status(400).send('One or more required query parameters are missing or incorrect. Ensure that app_id, user_id, and conversation_id are provided and are strings.');
  }

  // Ensure the directory exists
  const uploadPath = path.join(process.cwd(), 'uploads', app_id, user_id, conversation_id);
  fs.mkdir(uploadPath, { recursive: true }, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Configuration for Multer
    const dynamicUpload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadPath),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
      })
    }).single("file");

    // Use the multer instance to handle the file upload
    dynamicUpload(req, res, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      next();
    });
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
