import type { Server } from "socket.io";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import type { AppSocket } from "./socket.types.js";
import { createMessage } from "../modules/messages/messags.service.js";

const conversationIdSchema = z.string().trim().min(1).max(128);
const messagePayloadSchema = z.object({
  conversationId: conversationIdSchema,
  content: z.string().trim().min(1).max(500),
}).strict();

const MESSAGE_WINDOW_MS = 10_000;
const MAX_MESSAGES_PER_WINDOW = 8;

export const registerSocketHandlers = (io: Server, socket: AppSocket) => {
  const userId = socket.data.userId;
  if (!userId) {
    socket.disconnect();
    return;
  }

  let messageTimestamps: number[] = [];

  socket.on("conversation:join", async (rawConversationId, callback) => {
    const parsed = conversationIdSchema.safeParse(rawConversationId);
    if (!parsed.success) {
      callback?.({ success: false, error: "Invalid conversation ID" });
      return;
    }

    try {
      const conversationId = parsed.data;
      const member = await prisma.conversationMember.findUnique({
        where: { userId_conversationId: { userId, conversationId } },
        select: { id: true },
      });

      if (!member) {
        callback?.({ success: false, error: "You are not a member of this conversation" });
        return;
      }

      await socket.join(`conversation:${conversationId}`);
      callback?.({ success: true });
    } catch (error) {
      console.error("Conversation join failed", { socketId: socket.id, error });
      callback?.({ success: false, error: "Failed to join conversation" });
    }
  });

  socket.on("message:send", async (payload, callback) => {
    const parsed = messagePayloadSchema.safeParse(payload);
    if (!parsed.success) {
      callback?.({ success: false, error: "Message must contain a conversation ID and 1–500 characters" });
      return;
    }

    const now = Date.now();
    messageTimestamps = messageTimestamps.filter((timestamp) => now - timestamp < MESSAGE_WINDOW_MS);
    if (messageTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
      callback?.({ success: false, error: "You're sending messages too quickly. Please wait a moment." });
      return;
    }
    messageTimestamps.push(now);

    try {
      const { conversationId, content } = parsed.data;
      const message = await createMessage(userId, conversationId, content);
      io.to(`conversation:${conversationId}`).emit("message:new", {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      });
      callback?.({ success: true, messageId: message.id });
    } catch (error) {
      console.error("Message send failed", { userId, socketId: socket.id, error });
      callback?.({
        success: false,
        error: error instanceof Error && error.message === "You are not a member of this conversation"
          ? error.message
          : "Unable to send message",
      });
    }
  });

  socket.on("disconnect", (reason) => {
    console.info("Socket disconnected", { socketId: socket.id, userId, reason });
  });
};
