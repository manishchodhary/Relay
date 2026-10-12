import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import type { RegisterUserInput, LoginUserInput } from "./auth.validation.js";
import { signAccessToken } from "../../utils/jwt.js";

import { ApiError } from "../../utils/ApiError.js";

export const registerService = async (data: RegisterUserInput) => {
  const isExist = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (isExist) {
    throw new ApiError(409, "User already exist");
  }

  const hashedPasword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPasword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  const accessToken = signAccessToken({ userId: user.id });

  return {
    user,
    accessToken,
  };
};

export const loginService = async (data: LoginUserInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = signAccessToken({ userId: user.id });

  const { password, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
  };
};

export const userService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
    return user;
};

export const listUsersService = async (currentUserId: string) => {
  return prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 100,
  });
};
