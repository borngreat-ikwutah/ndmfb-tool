import type { EmailCredentials, EmailSignUpRequest } from "@ndmfb/contract";
import * as z from "zod";

/**
 * Runtime validators for the email auth surface.
 *
 * They mirror `packages/contract/auth.schema.json` ($defs.emailCredentials and
 * $defs.emailSignUpRequest) and are bound to the shared contract types with
 * `satisfies`, so a change to either side surfaces as a type error instead of
 * a silent runtime drift.
 */

// $defs.emailCredentials
export const emailCredentialsSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
}) satisfies z.ZodType<EmailCredentials>;

// $defs.emailSignUpRequest
export const emailSignUpSchema = emailCredentialsSchema.extend({
  name: z.string().trim().min(1, "Enter your name").max(80, "Name is too long"),
}) satisfies z.ZodType<EmailSignUpRequest>;

/**
 * Form schemas share one output shape ({ name, email, password }) so a single
 * typed form can drive both modes. Sign-up reuses the contract's name rule;
 * sign-in leaves the unused name field as an empty string.
 */
export const authFormSchema = z.object({
  name: z.string(),
  email: emailCredentialsSchema.shape.email,
  password: emailCredentialsSchema.shape.password,
});

export const authSignUpFormSchema = authFormSchema.extend({
  name: emailSignUpSchema.shape.name,
});

export type AuthFormValues = z.infer<typeof authFormSchema>;
