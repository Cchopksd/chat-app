import { z } from "zod";

export const AddMemberSchema = z.object({
  room_id: z.string().regex(/^[a-f\d]{24}$/, "Invalid ObjectId format"),
  members: z.array(
    z
      .string()
      .regex(/^[a-f\d]{24}$/, "Invalid ObjectId format")
      .min(1, { message: "Member cannot be empty" })
  ),
});

export type AddMemberDTO = z.infer<typeof AddMemberSchema>;

