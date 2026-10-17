import * as z from "zod";

/**
 * Runtime mirror of the profile update accepted by `POST /api/auth/update-user`
 * ({ name, image }). The response is the shared `User` shape
 * (packages/contract/auth.schema.json $defs.user).
 */
export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80, "Name is too long"),
  image: z.string().max(2048).optional(),
});

export type UpdateUserValues = z.infer<typeof updateUserSchema>;
