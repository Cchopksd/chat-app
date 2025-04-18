import { z } from "zod";

export const userIDSchema = z.object({
  userID: z.string().regex(/^[a-f\d]{24}$/, "Invalid ObjectId format"),
});

