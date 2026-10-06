import { z } from "zod";

export const addTaskProgressSchema = z.object({
  body: z.object({
    note: z.string().min(1, "Note is required").max(1000, "Note is too long"),
  }),
});
