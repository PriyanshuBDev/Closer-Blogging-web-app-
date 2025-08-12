import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  password: z.string().min(5),
});

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().optional(),
});

export const idSchema = z.string().uuid();

export type UserSchema = z.infer<typeof userSchema>;
export type BlogSchema = z.infer<typeof blogSchema>;
export type IdSchema = z.infer<typeof idSchema>;
