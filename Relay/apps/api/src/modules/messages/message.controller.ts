import type { RequestHandler } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { createMessageSchema } from "./message.schema.js";
import { createMessage } from "./messags.service.js";
import prisma from "../../lib/prisma.js";

export const createMessageController: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const conversationId = req.params.conversationId as string;

  if (!conversationId) {
    return res.status(400).json({
      success: false,
      message: "Conversation ID is required",
    });
  }

  const { content } = createMessageSchema.parse(req.body);
  const message = await createMessage(userId, conversationId, content);

  return res.status(201).json({ success: true, data: message });
});

export const listMessagesController: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const conversationId = req.params.conversationId as string;

  const member = await prisma.conversationMember.findUnique({
    where: { userId_conversationId: { userId, conversationId } },
  });

  if (!member) {
    return res.status(403).json({
      success: false,
      message: "You are not a member of this conversation",
    });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      createdAt: true,
    },
  });

  res.status(200).json({ success: true, data: messages });
});
