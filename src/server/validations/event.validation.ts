import { z } from "zod";
import { EVENT_COLORS } from "@/domain";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const createEventSchema = z.object({
  classId: z.string().uuid("classId must be a valid UUID"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000).optional().nullable(),
  color: z.enum(EVENT_COLORS),
  eventDate: z
    .string()
    .regex(datePattern, "eventDate must be in YYYY-MM-DD format")
    .refine((value) => !Number.isNaN(Date.parse(value)), "eventDate must be a valid date"),
});

export const updateEventSchema = createEventSchema
  .partial()
  .omit({ classId: true })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field is required to update an event",
  );

export const dateRangeSchema = z.object({
  from: z.string().regex(datePattern, "from must be in YYYY-MM-DD format"),
  to: z.string().regex(datePattern, "to must be in YYYY-MM-DD format"),
});
