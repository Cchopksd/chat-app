import { z } from "zod";

export const CreateChatSchema = z.object({
  room_id: z
    .string()
    .regex(/^[a-f\d]{24}$/, "Invalid ObjectId format")
    .min(1, "room_id is required"),
  sender_id: z
    .string()
    .regex(/^[a-f\d]{24}$/, "Invalid ObjectId format")
    .min(1, "sender_id is required"),
  content: z.string().min(1, "content is required"),
  message_type: z.enum(["text", "image", "file"]).default("text"),
});

export type CreateChatDTO = z.infer<typeof CreateChatSchema>;

