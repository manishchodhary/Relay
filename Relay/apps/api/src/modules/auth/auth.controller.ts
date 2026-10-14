import type { RequestHandler } from "express";
import { loginService, registerService, userService, listUsersService, googleLoginService } from "./auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { user, accessToken } = await registerService(req.body);
  return res.status(201).json({ success: true, data: { user, accessToken } });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { user, accessToken } = await loginService(req.body);
  return res.status(200).json({ success: true, data: { user, accessToken } });
});

export const googleLogin: RequestHandler = asyncHandler(async (req, res) => {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || credential.length === 0 || credential.length > 10000) {
    throw new ApiError(400, "A valid Google credential is required");
  }
  const { user, accessToken } = await googleLoginService(credential);
  return res.status(200).json({ success: true, data: { user, accessToken } });
});

export const user: RequestHandler = asyncHandler(async (req, res) => {
  const currentUser = await userService(req.user!.id);
  res.status(200).json({ success: true, data: currentUser });
});

export const listUsers: RequestHandler = asyncHandler(async (req, res) => {
  const users = await listUsersService(req.user!.id);
  res.status(200).json({ success: true, data: users });
});
