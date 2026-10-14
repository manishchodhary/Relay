import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import type { RegisterUserInput, LoginUserInput } from "./auth.validation.js";
import { signAccessToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/ApiError.js";
import { env } from "../../config/env.js";

export const registerService = async (data: RegisterUserInput) => {
  const isExist = await prisma.user.findUnique({ where: { email: data.email } });
  if (isExist) throw new ApiError(409, "User already exist");

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { email: data.email, name: data.name, password: hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return { user, accessToken: signAccessToken({ userId: user.id }) };
};

export const loginService = async (data: LoginUserInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true, name: true, email: true, password: true, createdAt: true },
  });

  if (!user?.password) throw new ApiError(401, "Invalid email or password");
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  const { password: _password, ...safeUser } = user;
  return { user: safeUser, accessToken: signAccessToken({ userId: user.id }) };
};

interface GoogleTokenInfo {
  aud?: string;
  iss?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  exp?: string;
}

export const googleLoginService = async (credential: string) => {
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new ApiError(503, "Google sign-in is not configured");

  let tokenInfo: GoogleTokenInfo;
  try {
    const url = new URL("https://oauth2.googleapis.com/tokeninfo");
    url.searchParams.set("id_token", credential);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Google rejected the ID token");
    tokenInfo = (await response.json()) as GoogleTokenInfo;
  } catch {
    throw new ApiError(401, "Google sign-in could not be verified");
  }

  const expiresAt = Number(tokenInfo.exp);
  if (
    tokenInfo.aud !== clientId ||
    !["accounts.google.com", "https://accounts.google.com"].includes(tokenInfo.iss ?? "") ||
    !tokenInfo.sub ||
    !tokenInfo.email ||
    tokenInfo.email_verified !== "true" ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    throw new ApiError(401, "Google sign-in could not be verified");
  }

  const email = tokenInfo.email.trim().toLowerCase();
  let user = await prisma.user.findUnique({ where: { googleId: tokenInfo.sub } });

  if (!user) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new ApiError(409, "An account already exists with this email. Sign in with your password first; automatic account linking is disabled.");
    }

    user = await prisma.user.create({
      data: {
        googleId: tokenInfo.sub,
        email,
        name: tokenInfo.name?.trim() || email.split("@")[0] || "Relay user",
        password: null,
      },
    });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  return { user: safeUser, accessToken: signAccessToken({ userId: user.id }) };
};

export const userService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });
  if (!user) throw new ApiError(404, "User not found");
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
