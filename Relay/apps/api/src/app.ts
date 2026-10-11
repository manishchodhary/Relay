import express, { type Express } from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import conversationRoutes from "./modules/conversation/conversation.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";

const app: Express = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api", messageRoutes);
app.use(errorHandler);

export default app;
