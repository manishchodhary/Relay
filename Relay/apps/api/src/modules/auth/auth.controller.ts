import type { RequestHandler } from "express";
import { loginService, registerService, userService, listUsersService } from "./auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { user, accessToken } = await registerService(req.body);

  return res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { user, accessToken } = await loginService(req.body);

  return res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

export const user: RequestHandler = asyncHandler(async (req, res) => {
  const currentUser = await userService(req.user!.id);

  res.status(200).json({
    success: true,
    data: currentUser,
  });
});

export const listUsers: RequestHandler = asyncHandler(async (req, res) => {
  const users = await listUsersService(req.user!.id);
  res.status(200).json({ success: true, data: users });
});
