import { z } from "zod";

export const roomIDSchema = z.object({
  roomID: z.string().regex(/^[a-f\d]{24}$/, "Invalid ObjectId format"),
});

