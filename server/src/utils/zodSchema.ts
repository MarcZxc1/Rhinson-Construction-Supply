import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(["ADMIN", "MANAGER", "STAFF", "USER"]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(["ADMIN", "MANAGER", "STAFF", "USER"]).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
});
