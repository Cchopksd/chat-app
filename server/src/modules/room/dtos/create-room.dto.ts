import { z } from "zod";

export const CreateChatRoomSchema = z
  .object({
    name: z.string().optional(),
    members: z.array(z.string().min(1, { message: "Member ID is required" })),
    isGroup: z.boolean().optional().default(false),
    isPrivate: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.isGroup) {
      // 🟩 สำหรับ group
      if (!data.name || data.name.trim().length === 0) {
        ctx.addIssue({
          path: ["name"],
          code: z.ZodIssueCode.custom,
          message: "Group name is required",
        });
      }
      if (data.members.length < 2) {
        ctx.addIssue({
          path: ["members"],
          code: z.ZodIssueCode.custom,
          message: "Group chat must have at least 2 members",
        });
      }
    } else {
      // 🟦 สำหรับ one-to-one
      if (data.members.length !== 2) {
        ctx.addIssue({
          path: ["members"],
          code: z.ZodIssueCode.custom,
          message: "One-to-one chat must have exactly 2 members",
        });
      }
    }
  });

export type CreateChatRoomDTO = z.infer<typeof CreateChatRoomSchema>;
