import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "testing"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URI: z.string(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
