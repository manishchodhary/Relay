import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createMessageController, listMessagesController } from "./message.controller.js";

const router: Router = Router();

router.get("/conversations/:conversationId/messages", authenticate, listMessagesController);
router.post("/conversations/:conversationId/messages", authenticate, createMessageController);

export default router;
