import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createOrGetDriectCoversation, listConversationsController } from "./conversation.controller.js";

const router: Router = Router();

router.get("/", authenticate, listConversationsController);
router.post("/direct", authenticate, createOrGetDriectCoversation);

export default router;
