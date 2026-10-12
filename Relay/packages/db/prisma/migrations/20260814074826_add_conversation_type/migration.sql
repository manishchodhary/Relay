ALTER TABLE "public"."Conversation" ADD COLUMN     "directKey" TEXT NOT NULL;
CREATE UNIQUE INDEX "Conversation_directKey_key" ON "public"."Conversation"("directKey");
