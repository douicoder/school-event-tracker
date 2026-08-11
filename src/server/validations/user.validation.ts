import { z } from "zod";
import { USER_ROLES } from "@/domain";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(USER_ROLES),
  assignedClassId: z.string().uuid().optional().nullable(),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name is too long").optional(),
    role: z.enum(USER_ROLES).optional(),
    assignedClassId: z.string().uuid().nullable().optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field is required to update a user",
  );
