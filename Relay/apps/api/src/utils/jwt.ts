import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface AccessTokenPayload {
  userId: string;
}

export const signAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
};
