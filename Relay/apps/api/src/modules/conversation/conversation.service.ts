import { Prisma } from "@repo/db";
import prisma from "../../lib/prisma.js";

export const getOrCreateDirectConversation = async (
  currentUserId: string,
  otherUserId: string,
) => {
  if (currentUserId === otherUserId) {
    throw new Error("You cannot create a conversation with yourself");
  }

  const [firstUserId, secondUserId] = [currentUserId, otherUserId].sort();
  const directKey = `${firstUserId}:${secondUserId}`;

  const existingConversation = await prisma.conversation.findUnique({
    where: { directKey },
    include: {
      conversationMembers: {
        select: { userId: true },
      },
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  try {
    return await prisma.conversation.create({
      data: {
        type: "DIRECT",
        directKey,
        conversationMembers: {
          create: [{ userId: currentUserId }, { userId: otherUserId }],
        },
      },
      include: {
        conversationMembers: {
          select: { userId: true },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const conversation = await prisma.conversation.findUnique({
        where: { directKey },
        include: {
          conversationMembers: {
            select: { userId: true },
          },
        },
      });

      if (conversation) {
        return conversation;
      }
    }

    throw error;
  }
};


export const listUserConversations = async (userId: string) => {
  return prisma.conversation.findMany({
    where: {
      conversationMembers: { some: { userId } },
    },
    include: {
      conversationMembers: {
        where: { userId: { not: userId } },
        select: { user: { select: { id: true, name: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, content: true, senderId: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
};
