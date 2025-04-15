import { z } from "zod";

export const CreateChatSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  members: z
    .array(z.string().min(1, { message: "Member name cannot be empty" }))
    .optional(),
  isGroup: z.boolean().optional(),
});

export type CreateChatDTO = z.infer<typeof CreateChatSchema>;

