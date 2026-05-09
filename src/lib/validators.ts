import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  country: z.string().min(2),
  phone: z.string().optional().default(""),
  companyType: z.string().min(2),
  objective: z.string().min(2),
  size: z.string().min(2),
  message: z.string().min(10),
  preferredLanguage: z.enum(["es", "en"]),
  website: z.string().optional().default("")
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const adminPostSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  locale: z.enum(["es", "en"]),
  excerpt: z.string().min(10),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  body: z.string().min(20),
  date: z.string().min(8),
  status: z.enum(["draft", "published"]).default("draft")
});
