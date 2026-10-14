import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { register, login, googleLogin, user, listUsers } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router: ExpressRouter = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/user", authenticate, user);
router.get("/users", authenticate, listUsers);

export default router;