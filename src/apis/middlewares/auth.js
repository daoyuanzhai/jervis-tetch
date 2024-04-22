import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const SECRET_KEY = process.env.SECRET_KEY;

const generateToken = (userData) => {
  return jwt.sign(userData, SECRET_KEY, { expiresIn: "30d" });
};

const jwtMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        {
          status: "error",
          message: "Authorization token is missing or invalid",
        },
        401
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    c.set("user", decoded); // Store decoded information in the context for further use in route handler
  } catch (error) {
    console.error("Failed to verify JWT:", error);
    return c.json({ status: "error", message: "Auth token is missing" }, 403);
  }

  return await next();
};

export { jwtMiddleware, generateToken };
