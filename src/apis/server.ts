import "reflect-metadata";

import express, { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { SendMessageRequest } from "../models/dto";
import { sendMessage } from "./rabbitMQService";

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
