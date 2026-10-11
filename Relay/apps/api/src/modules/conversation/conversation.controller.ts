import type { RequestHandler } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { createDirectConversationSchema } from "./conversation.schema.js";
import { getOrCreateDirectConversation, listUserConversations } from "./conversation.service.js";

export const createOrGetDriectCoversation: RequestHandler = asyncHandler(async (req, res) => {
  const { userId: otherUserId } = createDirectConversationSchema.parse(req.body);
  const currentUserId = req.user!.id;

  const conversation = await getOrCreateDirectConversation(currentUserId, otherUserId);

  res.status(201).json({
    success: true,
    message: "Conversation created",
    data: conversation,
  });
});

export const listConversationsController: RequestHandler = asyncHandler(async (req, res) => {
  const conversations = await listUserConversations(req.user!.id);
  res.status(200).json({ success: true, data: conversations });
});
