import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const root = process.cwd();
const blogImageDir = path.join(root, "public", "images", "blog");
const publicPrefix = "/images/blog";
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);
const maxFileSize = 8 * 1024 * 1024;

async function ensureImageDir() {
  await mkdir(blogImageDir, { recursive: true });
}

function safeFileName(fileName: string, mimeType: string) {
  const extensionFromName = path.extname(fileName).replace(".", "").toLowerCase();
  const extension = allowedTypes.get(mimeType) ?? extensionFromName;
  const baseName = path.basename(fileName, path.extname(fileName));
  const slug = slugify(baseName) || "blog-image";

  return `${slug}-${Date.now()}.${extension}`;
}

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  await ensureImageDir();
  const files = await readdir(blogImageDir);
  const images = await Promise.all(
    files
      .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file))
      .map(async (file) => {
        const filePath = path.join(blogImageDir, file);
        const info = await stat(filePath);

        return {
          name: file,
          path: `${publicPrefix}/${file}`,
          size: info.size,
          updatedAt: info.mtime.toISOString()
        };
      })
  );

  images.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return NextResponse.json(images);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Missing image file." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ message: "Unsupported image type. Use JPG, PNG, WebP, or GIF." }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ message: "Image is too large. Max size is 8MB." }, { status: 400 });
  }

  await ensureImageDir();
  const fileName = safeFileName(file.name, file.type);
  const filePath = path.join(blogImageDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return NextResponse.json({
    name: fileName,
    path: `${publicPrefix}/${fileName}`,
    size: file.size,
    updatedAt: new Date().toISOString()
  });
}
