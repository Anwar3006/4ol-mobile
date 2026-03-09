import z from "zod";
import { MARKETING_TYPE_ENUM } from "../types/formInput";
import { marketingProfile } from "../models/marketing.model";
import { createSelectSchema } from "drizzle-zod";

export const marketingProfileSchema = z.object({
  marketingType: z.enum(MARKETING_TYPE_ENUM),
  headline: z.string().min(5, "Headline must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description"),
  imageUrl: z.string(),
  organization: z.string().min(2, "Organization name is required"),
  links: z.object().catchall(z.string().optional()),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  cta: z.string().min(1, "Please select a Call to Action"),
});

export type TMarketingProfileInput = z.infer<typeof marketingProfileSchema>;

const selectSchema = createSelectSchema(marketingProfile).omit({
  createdAt: true,
  updatedAt: true,
});
export type TMarketingProfileOutput = z.infer<typeof selectSchema>;
