import * as z from "zod";

export const updateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.email().optional(),
  bio: z.string().max(160).optional(),
  avatarUrl: z.url().optional(),
});

export const deleteUserSchema = z.object({
  user_id: z.string(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
