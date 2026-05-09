import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { getAllBlogPosts } from "@/lib/blog";
import type { AdminBlogRecord, Locale } from "@/lib/types";
import { slugify } from "@/lib/utils";

type TranslationPayload = {
  post?: AdminBlogRecord;
  targetLocale?: Locale;
};

type TranslatedFields = {
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  body?: string;
};

function getOppositeLocale(locale: Locale) {
  return locale === "es" ? "en" : "es";
}

function extractOutputText(data: unknown) {
  if (typeof data !== "object" || data === null) {
    return "";
  }

  if ("output_text" in data && typeof data.output_text === "string") {
    return data.output_text;
  }

  const output = "output" in data && Array.isArray(data.output) ? data.output : [];

  return output
    .flatMap((item) => {
      if (typeof item !== "object" || item === null || !("content" in item) || !Array.isArray(item.content)) {
        return [];
      }

      const contentItems = item.content as unknown[];

      return contentItems.map((contentItem: unknown) => {
        if (typeof contentItem !== "object" || contentItem === null) {
          return "";
        }

        if ("text" in contentItem && typeof contentItem.text === "string") {
          return contentItem.text;
        }

        if ("value" in contentItem && typeof contentItem.value === "string") {
          return contentItem.value;
        }

        return "";
      });
    })
    .filter(Boolean)
    .join("\n");
}

function parseJsonFromModel(text: string): TranslatedFields {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(cleaned) as TranslatedFields;
}

function normalizeTranslatedPost(source: AdminBlogRecord, targetLocale: Locale, fields: TranslatedFields) {
  const title = fields.title?.trim() || source.title;
  const slug = fields.slug?.trim() || source.slug || slugify(title);

  return {
    ...source,
    title,
    slug,
    excerpt: fields.excerpt?.trim() || source.excerpt,
    category: fields.category?.trim() || source.category,
    tags: Array.isArray(fields.tags) ? fields.tags.filter(Boolean) : source.tags,
    seoTitle: fields.seoTitle?.trim() || source.seoTitle || title,
    seoDescription: fields.seoDescription?.trim() || source.seoDescription || source.excerpt,
    coverImage: fields.coverImage?.trim() || source.coverImage,
    body: fields.body?.trim() || source.body,
    locale: targetLocale,
    status: "draft" as const,
    updatedAt: new Date().toISOString(),
    source: "admin" as const
  } satisfies AdminBlogRecord;
}

async function findPublishedTranslation(post: AdminBlogRecord, targetLocale: Locale) {
  const targetPosts = await getAllBlogPosts(targetLocale);
  return targetPosts.find((candidate) => candidate.slug === post.slug);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as TranslationPayload | null;
  const post = payload?.post;
  const targetLocale = payload?.targetLocale ?? (post?.locale ? getOppositeLocale(post.locale) : undefined);

  if (!post || !targetLocale || !["es", "en"].includes(targetLocale)) {
    return NextResponse.json({ message: "Invalid translation payload." }, { status: 400 });
  }

  const existingTranslation = await findPublishedTranslation(post, targetLocale);
  if (existingTranslation) {
    return NextResponse.json({
      mode: "existing",
      post: normalizeTranslatedPost(post, targetLocale, existingTranslation)
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "No encontré una traducción publicada para este slug. Para traducir automáticamente posts nuevos, agrega OPENAI_API_KEY en .env.local."
      },
      { status: 400 }
    );
  }

  const languageName = targetLocale === "en" ? "English" : "Spanish";
  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a senior bilingual marketing translator for a LATAM loyalty, rewards and SaaS company. Translate with commercial clarity, preserve brand names, preserve HTML/Markdown structure, preserve links, and return only valid JSON."
        },
        {
          role: "user",
          content: JSON.stringify({
            targetLanguage: languageName,
            instructions:
              "Translate all public-facing editorial fields. Keep the same meaning, make it natural for business readers, and keep body formatting intact.",
            post: {
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              category: post.category,
              tags: post.tags,
              seoTitle: post.seoTitle,
              seoDescription: post.seoDescription,
              body: post.body
            },
            expectedJsonShape: {
              title: "string",
              slug: "url-safe slug string",
              excerpt: "string",
              category: "string",
              tags: ["string"],
              seoTitle: "string",
              seoDescription: "string",
              body: "string"
            }
          })
        }
      ]
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    return NextResponse.json({ message: "No se pudo traducir automáticamente el post." }, { status: 502 });
  }

  const data = await response.json();
  const outputText = extractOutputText(data);
  let fields: TranslatedFields;

  try {
    fields = parseJsonFromModel(outputText);
  } catch {
    return NextResponse.json({ message: "La traducción no devolvió un JSON válido." }, { status: 502 });
  }

  return NextResponse.json({
    mode: "generated",
    post: normalizeTranslatedPost(post, targetLocale, fields)
  });
}
