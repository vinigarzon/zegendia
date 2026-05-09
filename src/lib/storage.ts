import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

import type { AdminBlogRecord, LeadRecord } from "@/lib/types";

const root = process.cwd();
const localDataDir = path.join(root, "src", "content", "admin");

type LocalShape = {
  posts: AdminBlogRecord[];
  leads: LeadRecord[];
};

async function ensureLocalDataDir() {
  await mkdir(localDataDir, { recursive: true });
}

function useNetlifyBlobs() {
  return process.env.NETLIFY_DATABASE_MODE === "blobs" || Boolean(process.env.NETLIFY);
}

async function readLocalJson<T>(fileName: string, fallback: T) {
  await ensureLocalDataDir();
  const filePath = path.join(localDataDir, fileName);

  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    await writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

async function writeLocalJson<T>(fileName: string, data: T) {
  await ensureLocalDataDir();
  await writeFile(path.join(localDataDir, fileName), JSON.stringify(data, null, 2));
}

export async function listAdminPosts() {
  if (useNetlifyBlobs()) {
    const store = getStore("admin-posts");
    const { blobs } = await store.list();

    const posts = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key, { type: "json" });
        return data as AdminBlogRecord;
      })
    );

    return posts.filter(Boolean);
  }

  return readLocalJson<AdminBlogRecord[]>("posts.json", []);
}

export async function upsertAdminPost(record: AdminBlogRecord) {
  if (useNetlifyBlobs()) {
    const store = getStore("admin-posts");
    await store.setJSON(`${record.locale}:${record.slug}`, record);
    return record;
  }

  const posts = await listAdminPosts();
  const next = [...posts.filter((post) => !(post.slug === record.slug && post.locale === record.locale)), record];
  await writeLocalJson("posts.json", next);
  return record;
}

export async function deleteAdminPost(locale: AdminBlogRecord["locale"], slug: string) {
  if (useNetlifyBlobs()) {
    const store = getStore("admin-posts");
    await store.delete(`${locale}:${slug}`);
    return true;
  }

  const posts = await listAdminPosts();
  const next = posts.filter((post) => !(post.slug === slug && post.locale === locale));
  await writeLocalJson("posts.json", next);
  return true;
}

export async function listLeads() {
  if (useNetlifyBlobs()) {
    const store = getStore("zegendia-leads");
    const { blobs } = await store.list();

    const leads = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key, { type: "json" });
        return data as LeadRecord;
      })
    );

    return leads.filter(Boolean);
  }

  return readLocalJson<LeadRecord[]>("leads.json", []);
}

export async function createLead(record: LeadRecord) {
  if (useNetlifyBlobs()) {
    const store = getStore("zegendia-leads");
    await store.setJSON(record.id, record);
    return record;
  }

  const leads = await listLeads();
  const next = [record, ...leads];
  await writeLocalJson("leads.json", next);
  return record;
}

export async function getStorageDebugInfo() {
  const mode = useNetlifyBlobs() ? "blobs" : "local";
  return { mode };
}

export async function initializeLocalStore() {
  const initial: LocalShape = {
    posts: [],
    leads: []
  };

  await ensureLocalDataDir();
  await Promise.all([
    readLocalJson("posts.json", initial.posts),
    readLocalJson("leads.json", initial.leads)
  ]);
}
