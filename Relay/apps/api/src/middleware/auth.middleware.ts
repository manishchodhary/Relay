import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../utils/jwt.js";
import asyncHandler from "../utils/asyncHandler.js";

export const authenticate: RequestHandler = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  req.user = user;
  next();
});
