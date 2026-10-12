CREATE TYPE "public"."ConversationType" AS ENUM ('DIRECT', 'GROUP');
ALTER TABLE "public"."Conversation" ADD COLUMN     "type" "public"."ConversationType" NOT NULL;
