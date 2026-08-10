import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(1000).optional().nullable(),
});

export const updateClassSchema = createClassSchema.partial();
