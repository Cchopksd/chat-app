import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password cannot be empty" }),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
