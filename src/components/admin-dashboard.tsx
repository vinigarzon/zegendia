"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminBlogRecord, LeadRecord } from "@/lib/types";
import { slugify } from "@/lib/utils";

type AdminImage = {
  name: string;
  path: string;
  size: number;
  updatedAt: string;
};

type AdminSection = "posts" | "editor" | "library" | "leads";
type StatusFilter = "all" | "published" | "draft";
type LocaleFilter = "all" | "es" | "en";

function createEmptyPost(): AdminBlogRecord {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: "",
    tags: [],
    date: new Date().toISOString().slice(0, 10),
    locale: "es",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    body: "",
    status: "draft",
    updatedAt: "",
    source: "admin"
  };
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAdminDate(date?: string) {
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

function getPostKey(post: Pick<AdminBlogRecord, "locale" | "slug">) {
  return `${post.locale}:${post.slug}`;
}

function FieldLabel({ children, helper }: { children: ReactNode; helper?: string }) {
  return (
    <label className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{children}</span>
      {helper ? <span className="block text-xs leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );
}

function StatusPill({ status }: { status?: "draft" | "published" }) {
  const published = status === "published";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
        published
          ? "border-[#549c24]/35 bg-[#549c24]/12 text-[#b7e78c]"
          : "border-[#e44c44]/35 bg-[#e44c44]/10 text-[#ffb0aa]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-[#549c24]" : "bg-[#e44c44]"}`} />
      {published ? "Publicado" : "Borrador"}
    </span>
  );
}

function isHtmlContent(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownToBasicHtml(source: string) {
  const lines = source.split("\n");
  const html: string[] = [];
  let listOpen: "ul" | "ol" | null = null;

  function closeList() {
    if (listOpen) {
      html.push(`</${listOpen}>`);
      listOpen = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      closeList();
      html.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      closeList();
      html.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      closeList();
      html.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      closeList();
      html.push(`<blockquote>${escapeHtml(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    if (/^- /.test(trimmed)) {
      if (listOpen !== "ul") {
        closeList();
        listOpen = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
      continue;
    }

    const numbered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numbered) {
      if (listOpen !== "ol") {
        closeList();
        listOpen = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${escapeHtml(numbered[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  }

  closeList();
  return html.join("\n");
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "source">("visual");
  const visualValue = useMemo(() => (isHtmlContent(value) ? value : markdownToBasicHtml(value)), [value]);

  useEffect(() => {
    if (mode === "visual" && editorRef.current && editorRef.current.innerHTML !== visualValue) {
      editorRef.current.innerHTML = visualValue;
    }
  }, [mode, visualValue]);

  function runCommand(command: string, argument?: string) {
    document.execCommand(command, false, argument);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }

  function formatBlock(tag: "h2" | "h3" | "p" | "blockquote") {
    runCommand("formatBlock", tag);
  }

  function addLink() {
    const url = window.prompt("URL del enlace");
    if (url) {
      runCommand("createLink", url);
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#071020]/72">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/[0.035] p-3">
        {[
          { label: "P", action: () => formatBlock("p") },
          { label: "H2", action: () => formatBlock("h2") },
          { label: "H3", action: () => formatBlock("h3") },
          { label: "Bold", action: () => runCommand("bold") },
          { label: "Italic", action: () => runCommand("italic") },
          { label: "Lista", action: () => runCommand("insertUnorderedList") },
          { label: "Numerada", action: () => runCommand("insertOrderedList") },
          { label: "Quote", action: () => formatBlock("blockquote") },
          { label: "Link", action: addLink }
        ].map((item) => (
          <button
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#78d5d7]/35 hover:bg-[#2e636b]/18"
            key={item.label}
            onClick={item.action}
            type="button"
          >
            {item.label}
          </button>
        ))}
        <div className="ml-auto flex rounded-full border border-white/10 bg-black/20 p-1">
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${mode === "visual" ? "bg-[#549c24] text-white" : "text-slate-400"}`}
            onClick={() => setMode("visual")}
            type="button"
          >
            Visual
          </button>
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${mode === "source" ? "bg-[#3d284c] text-white" : "text-slate-400"}`}
            onClick={() => setMode("source")}
            type="button"
          >
            Código
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <div
          className="prose prose-invert max-h-[68vh] min-h-[560px] max-w-none overflow-y-auto px-5 py-5 prose-headings:font-display prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-a:text-[#78d5d7] prose-blockquote:border-l-[#e44c44] prose-blockquote:text-white focus:outline-none"
          contentEditable
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
          ref={editorRef}
          suppressContentEditableWarning
        />
      ) : (
        <Textarea
          className="max-h-[68vh] min-h-[560px] rounded-none border-0 bg-transparent font-mono leading-7 focus-visible:ring-0"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      )}
    </div>
  );
}

export function AdminDashboard() {
  const [posts, setPosts] = useState<AdminBlogRecord[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [images, setImages] = useState<AdminImage[]>([]);
  const [form, setForm] = useState<AdminBlogRecord>(() => createEmptyPost());
  const [activeSection, setActiveSection] = useState<AdminSection>("posts");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [localeFilter, setLocaleFilter] = useState<LocaleFilter>("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [imageMessage, setImageMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [actingPostKey, setActingPostKey] = useState("");

  useEffect(() => {
    void Promise.all([
      fetch("/api/admin/posts").then((response) => response.json()),
      fetch("/api/admin/leads").then((response) => response.json()),
      fetch("/api/admin/images").then((response) => response.json())
    ]).then(([postsData, leadsData, imagesData]) => {
      setPosts(Array.isArray(postsData) ? (postsData as AdminBlogRecord[]) : []);
      setLeads(Array.isArray(leadsData) ? (leadsData as LeadRecord[]) : []);
      setImages(Array.isArray(imagesData) ? (imagesData as AdminImage[]) : []);
    });
  }, []);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.date || 0).getTime();
        const dateB = new Date(b.updatedAt || b.date || 0).getTime();
        return dateB - dateA;
      }),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedPosts.filter((post) => {
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      const matchesLocale = localeFilter === "all" || post.locale === localeFilter;
      const searchable = [post.title, post.slug, post.category, post.excerpt, post.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || searchable.includes(query);

      return matchesStatus && matchesLocale && matchesSearch;
    });
  }, [localeFilter, search, sortedPosts, statusFilter]);

  const sortedLeads = useMemo(
    () => [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [leads]
  );

  const stats = useMemo(
    () => [
      { label: "Posts admin", value: String(posts.length), tone: "cyan" },
      { label: "Publicados", value: String(posts.filter((post) => post.status === "published").length), tone: "green" },
      { label: "Borradores", value: String(posts.filter((post) => post.status !== "published").length), tone: "warm" },
      { label: "Imágenes", value: String(images.length), tone: "purple" },
      { label: "Leads", value: String(leads.length), tone: "cyan" }
    ],
    [images.length, leads.length, posts]
  );

  const suggestedSlug = form.slug || slugify(form.title);
  const publicPath =
    suggestedSlug && form.status === "published"
      ? `${form.locale === "en" ? "/en" : ""}/blog/${suggestedSlug}`
      : "";

  function update<K extends keyof AdminBlogRecord>(key: K, value: AdminBlogRecord[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function newPost() {
    setForm(createEmptyPost());
    setMessage("");
    setImageMessage("");
    setActiveSection("editor");
  }

  function editPost(post: AdminBlogRecord) {
    setForm(post);
    setMessage("");
    setImageMessage("");
    setActiveSection("editor");
  }

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      slug: suggestedSlug,
      tags: form.tags
    };

    const response = await fetch("/api/admin/posts", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) {
      setMessage("No se pudo guardar el post. Revisa los campos obligatorios.");
      return;
    }

    const post = (await response.json()) as AdminBlogRecord;
    setPosts((current) => [post, ...current.filter((item) => getPostKey(item) !== getPostKey(post))]);
    setForm(post);
    setMessage(post.status === "published" ? "Post publicado/actualizado." : "Borrador guardado.");
  }

  async function savePostStatus(post: AdminBlogRecord, status: "draft" | "published") {
    const key = getPostKey(post);
    setActingPostKey(key);
    setMessage("");

    const response = await fetch("/api/admin/posts", {
      body: JSON.stringify({ ...post, status, slug: post.slug || slugify(post.title) }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    setActingPostKey("");

    if (!response.ok) {
      setMessage("No se pudo actualizar el estado del post.");
      return;
    }

    const updatedPost = (await response.json()) as AdminBlogRecord;
    setPosts((current) => [updatedPost, ...current.filter((item) => getPostKey(item) !== getPostKey(updatedPost))]);

    if (getPostKey(form) === key) {
      setForm(updatedPost);
    }

    setMessage(status === "published" ? "Post publicado." : "Post enviado a borrador.");
  }

  async function deletePost(post: AdminBlogRecord) {
    const confirmed = window.confirm(
      `¿Borrar "${post.title}"?\n\nSi es un post base del sitio, lo ocultaremos del front como borrador para no destruir el archivo original.`
    );

    if (!confirmed) {
      return;
    }

    const key = getPostKey(post);
    setActingPostKey(key);
    setMessage("");

    const response = await fetch("/api/admin/posts", {
      body: JSON.stringify({ locale: post.locale, slug: post.slug }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE"
    });

    setActingPostKey("");

    if (!response.ok) {
      setMessage("No se pudo borrar el post.");
      return;
    }

    const result = (await response.json()) as { mode: "deleted" | "hidden"; post?: AdminBlogRecord };

    if (result.mode === "hidden" && result.post) {
      setPosts((current) => [result.post as AdminBlogRecord, ...current.filter((item) => getPostKey(item) !== key)]);
      if (getPostKey(form) === key) {
        setForm(result.post);
      }
      setMessage("Post base ocultado del front y marcado como borrador.");
      return;
    }

    setPosts((current) => current.filter((item) => getPostKey(item) !== key));
    if (getPostKey(form) === key) {
      setForm(createEmptyPost());
      setActiveSection("posts");
    }
    setMessage("Post borrado.");
  }

  async function translateCurrentPost(targetLocale?: "es" | "en") {
    const nextLocale = targetLocale ?? (form.locale === "es" ? "en" : "es");

    if (!form.title.trim() || !form.body.trim()) {
      setMessage("Necesito al menos título y contenido para traducir este post.");
      return;
    }

    setIsTranslating(true);
    setMessage("");

    const response = await fetch("/api/admin/posts/translate", {
      body: JSON.stringify({ post: { ...form, slug: suggestedSlug }, targetLocale: nextLocale }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    setIsTranslating(false);

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(error?.message ?? "No se pudo traducir el post.");
      return;
    }

    const result = (await response.json()) as { mode: "existing" | "generated"; post: AdminBlogRecord };
    setForm(result.post);
    setActiveSection("editor");
    setMessage(
      result.mode === "existing"
        ? "Cargué la versión traducida que ya estaba publicada. Revísala y guarda si quieres editarla."
        : "Traducción automática creada como borrador. Revísala antes de publicar."
    );
  }

  function handleLocaleChange(locale: "es" | "en") {
    if (locale === form.locale) {
      return;
    }

    if (!form.title.trim() && !form.body.trim()) {
      update("locale", locale);
      return;
    }

    void translateCurrentPost(locale);
  }

  async function uploadCoverImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImageMessage("");
    setIsUploading(true);

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/admin/images", {
      body,
      method: "POST"
    });

    setIsUploading(false);
    event.target.value = "";

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { message?: string } | null;
      setImageMessage(error?.message ?? "No se pudo subir la imagen.");
      return;
    }

    const image = (await response.json()) as AdminImage;
    setImages((current) => [image, ...current.filter((item) => item.path !== image.path)]);
    update("coverImage", image.path);
    setImageMessage(`Imagen subida: ${image.name}`);
  }

  function selectImage(path: string) {
    update("coverImage", path);
    setImageMessage("Imagen seleccionada como portada.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((item) => (
          <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.045] p-5" key={item.label}>
            <div
              className={`absolute inset-x-0 top-0 h-px ${
                item.tone === "green"
                  ? "bg-[#549c24]"
                  : item.tone === "warm"
                    ? "bg-[#e44c44]"
                    : item.tone === "purple"
                      ? "bg-[#3d284c]"
                      : "bg-[#2e636b]"
              }`}
            />
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
            <div className="mt-3 font-display text-3xl font-semibold text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-3">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { key: "posts" as const, title: "Posts", text: "Listado, búsqueda y estados" },
            { key: "editor" as const, title: "Editor", text: "Crear, editar, SEO y publicar" },
            { key: "library" as const, title: "Biblioteca", text: "Subir y seleccionar imágenes" },
            { key: "leads" as const, title: "Leads", text: "Contactos recibidos" }
          ].map((tab) => {
            const active = activeSection === tab.key;

            return (
              <button
                className={`rounded-[24px] border px-5 py-4 text-left transition ${
                  active
                    ? "border-[#78d5d7]/35 bg-[#2e636b]/18 text-white"
                    : "border-white/8 bg-transparent text-slate-400 hover:border-white/16 hover:bg-white/[0.035]"
                }`}
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      tab.key === "posts"
                        ? "bg-[#e44c44]"
                        : tab.key === "editor"
                          ? "bg-[#2e636b]"
                          : tab.key === "library"
                            ? "bg-[#549c24]"
                            : "bg-[#3d284c]"
                    }`}
                  />
                  <span className="font-display text-xl font-semibold">{tab.title}</span>
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-400">{tab.text}</div>
              </button>
            );
          })}
        </div>
      </div>

      {activeSection === "posts" ? (
        <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="section-kicker section-kicker--warm mb-3">Centro editorial</div>
              <h2 className="font-display text-3xl font-semibold text-white">Todos los blogs del sitio</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                Aquí aparecen los posts migrados/admin y los posts base del sitio. Si editas un post base, se crea una versión administrable que reemplaza al seed en el front.
              </p>
            </div>
            <Button onClick={newPost} type="button" variant="brandWarm">
              Crear nuevo post
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <Input onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título, slug, categoría o tag" value={search} />
            <select
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              value={statusFilter}
            >
              <option className="bg-slate-950" value="all">Todos</option>
              <option className="bg-slate-950" value="published">Publicados</option>
              <option className="bg-slate-950" value="draft">Borradores</option>
            </select>
            <select
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              onChange={(event) => setLocaleFilter(event.target.value as LocaleFilter)}
              value={localeFilter}
            >
              <option className="bg-slate-950" value="all">Todos</option>
              <option className="bg-slate-950" value="es">Español</option>
              <option className="bg-slate-950" value="en">English</option>
            </select>
          </div>
          {message ? (
            <div className="mt-4 rounded-2xl border border-[#549c24]/25 bg-[#549c24]/10 px-4 py-3 text-sm text-[#b7e78c]">
              {message}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10">
            <div className="hidden grid-cols-[92px_1fr_110px_130px_300px] gap-4 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 lg:grid">
              <div>Imagen</div>
              <div>Post</div>
              <div>Idioma</div>
              <div>Estado</div>
              <div>Acciones</div>
            </div>
            <div className="divide-y divide-white/8">
              {filteredPosts.length === 0 ? (
                <div className="p-6 text-sm text-slate-400">No hay posts que coincidan con esos filtros.</div>
              ) : (
                filteredPosts.map((post) => {
                  const href = `${post.locale === "en" ? "/en" : ""}/blog/${post.slug}`;

                  return (
                    <div
                      className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.025] lg:grid-cols-[92px_1fr_110px_130px_300px] lg:items-center"
                      key={getPostKey(post)}
                    >
                      <button
                        className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#071020] lg:aspect-square"
                        onClick={() => editPost(post)}
                        type="button"
                      >
                        {post.coverImage ? (
                          <img alt={post.title} className="h-full w-full object-cover" src={post.coverImage} />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-600">Sin imagen</div>
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                            {post.source === "seed" ? "Seed" : "Admin"}
                          </span>
                          {post.category ? <span className="text-xs text-[#9de1e3]">{post.category}</span> : null}
                        </div>
                        <button className="mt-2 text-left font-display text-xl font-semibold text-white" onClick={() => editPost(post)} type="button">
                          {post.title}
                        </button>
                        <div className="mt-1 truncate text-xs text-slate-500">{post.slug}</div>
                        <div className="mt-2 text-xs text-slate-400">{formatAdminDate(post.date)}</div>
                      </div>
                      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">{post.locale}</div>
                      <StatusPill status={post.status} />
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => editPost(post)} size="sm" type="button" variant="secondary">
                          Editar
                        </Button>
                        <Button
                          disabled={actingPostKey === getPostKey(post)}
                          onClick={() => void savePostStatus(post, post.status === "published" ? "draft" : "published")}
                          size="sm"
                          type="button"
                          variant={post.status === "published" ? "brandWarm" : "brandGreen"}
                        >
                          {post.status === "published" ? "Draft" : "Publicar"}
                        </Button>
                        {post.status === "published" ? (
                          <Link
                            className="inline-flex items-center justify-center rounded-full border border-[#78d5d7]/25 bg-[#2e636b]/18 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#a7eef0]"
                            href={href}
                            target="_blank"
                          >
                            Ver
                          </Link>
                        ) : null}
                        <button
                          className="inline-flex items-center justify-center rounded-full border border-[#e44c44]/35 bg-[#e44c44]/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb0aa] transition hover:bg-[#e44c44]/18 disabled:opacity-50"
                          disabled={actingPostKey === getPostKey(post)}
                          onClick={() => void deletePost(post)}
                          type="button"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}

      {activeSection === "editor" ? (
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(720px,1fr)_340px]">
          <aside className="hidden xl:block">
            <div className="sticky top-8 max-h-[calc(100vh-64px)] overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045]">
              <div className="h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
              <div className="border-b border-white/10 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9de1e3]">Navegación</div>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">Posts</h3>
                <button
                  className="mt-4 w-full rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  onClick={() => setActiveSection("posts")}
                  type="button"
                >
                  Volver al listado completo
                </button>
              </div>
              <div className="max-h-[calc(100vh-235px)] overflow-y-auto p-3">
                {filteredPosts.map((post) => {
                  const active = getPostKey(post) === getPostKey({ locale: form.locale, slug: suggestedSlug });

                  return (
                    <button
                      className={`mb-2 w-full rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-[#78d5d7]/35 bg-[#2e636b]/18"
                          : "border-white/8 bg-white/[0.025] hover:border-white/16 hover:bg-white/[0.045]"
                      }`}
                      key={`nav-${getPostKey(post)}`}
                      onClick={() => editPost(post)}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{post.locale}</span>
                        <span className={`h-2 w-2 rounded-full ${post.status === "published" ? "bg-[#549c24]" : "bg-[#e44c44]"}`} />
                      </div>
                      <div className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-white">{post.title}</div>
                      <div className="mt-2 truncate text-xs text-slate-500">{post.slug}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <form className="min-w-0 space-y-5" onSubmit={submitPost}>
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="section-kicker section-kicker--warm mb-3">
                    {form.slug ? "Editando post" : "Nuevo post"}
                  </div>
                  <h2 className="font-display text-3xl font-semibold text-white">Contenido principal</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                    Empieza por la idea editorial. El slug puede generarse solo desde el título, pero puedes ajustarlo si necesitas una URL exacta.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={newPost} type="button" variant="secondary">
                    Nuevo post
                  </Button>
                  <Button
                    disabled={isTranslating}
                    onClick={() => void translateCurrentPost()}
                    type="button"
                    variant={form.locale === "es" ? "brandGreen" : "brandWarm"}
                  >
                    {isTranslating ? "Traduciendo..." : form.locale === "es" ? "Crear versión EN" : "Crear versión ES"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <FieldLabel>Título</FieldLabel>
                  <Input onChange={(event) => update("title", event.target.value)} placeholder="Título del artículo" value={form.title} />
                </div>
                <div>
                  <FieldLabel helper={suggestedSlug ? `URL: /blog/${suggestedSlug}` : "Se genera desde el título."}>Slug</FieldLabel>
                  <Input onChange={(event) => update("slug", event.target.value)} placeholder="slug-opcional" value={form.slug} />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <FieldLabel>Idioma</FieldLabel>
                  <select
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                    onChange={(event) => handleLocaleChange(event.target.value as "es" | "en")}
                    value={form.locale}
                  >
                    <option className="bg-slate-950" value="es">Español</option>
                    <option className="bg-slate-950" value="en">English</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Categoría</FieldLabel>
                  <Input onChange={(event) => update("category", event.target.value)} placeholder="Estrategia de loyalty" value={form.category} />
                </div>
                <div>
                  <FieldLabel>Estado</FieldLabel>
                  <select
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                    onChange={(event) => update("status", event.target.value as "draft" | "published")}
                    value={form.status}
                  >
                    <option className="bg-slate-950" value="draft">Borrador</option>
                    <option className="bg-slate-950" value="published">Publicado</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <FieldLabel helper="Debe vender la lectura y también sirve para SEO/social.">Resumen / excerpt</FieldLabel>
                <Textarea
                  className="min-h-28"
                  onChange={(event) => update("excerpt", event.target.value)}
                  placeholder="Resumen corto del artículo..."
                  value={form.excerpt}
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#549c24,#2e636b)]" />
              <div className="mb-5">
                <div className="section-kicker section-kicker--green mb-3">SEO y clasificación</div>
                <h2 className="font-display text-3xl font-semibold text-white">Metadatos editoriales</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>SEO title</FieldLabel>
                  <Input onChange={(event) => update("seoTitle", event.target.value)} placeholder="Título para Google" value={form.seoTitle} />
                </div>
                <div>
                  <FieldLabel>Fecha de publicación</FieldLabel>
                  <Input onChange={(event) => update("date", event.target.value)} type="date" value={form.date} />
                </div>
              </div>
              <div className="mt-4">
                <FieldLabel>SEO description</FieldLabel>
                <Textarea
                  className="min-h-24"
                  onChange={(event) => update("seoDescription", event.target.value)}
                  placeholder="Descripción SEO del artículo..."
                  value={form.seoDescription}
                />
              </div>
              <div className="mt-4">
                <FieldLabel helper="Separados por coma. Ejemplo: loyalty, rewards, LATAM">Tags</FieldLabel>
                <Input
                  onChange={(event) =>
                    update(
                      "tags",
                      event.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="Tags separados por coma"
                  value={form.tags.join(", ")}
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#2e636b,#3d284c)]" />
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="section-kicker section-kicker--cyan mb-3">Portada</div>
                  <h2 className="font-display text-3xl font-semibold text-white">Imagen del artículo</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                    Sube una imagen o selecciónala desde la biblioteca. La portada se usa en blog, detalle y Open Graph.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#78d5d7]/25 bg-[#2e636b]/18 px-5 py-3 text-sm font-semibold text-[#a7eef0] transition hover:border-[#78d5d7]/45 hover:bg-[#2e636b]/28">
                  {isUploading ? "Subiendo..." : "Subir imagen"}
                  <input
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={uploadCoverImage}
                    type="file"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
                <div>
                  <FieldLabel>Ruta de portada</FieldLabel>
                  <Input onChange={(event) => update("coverImage", event.target.value)} placeholder="/images/blog/imagen.jpg" value={form.coverImage} />
                  <div className="mt-3 flex flex-wrap gap-3">
                    {form.coverImage ? (
                      <button
                        className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb0aa]"
                        onClick={() => update("coverImage", "")}
                        type="button"
                      >
                        Limpiar portada
                      </button>
                    ) : null}
                    {imageMessage ? <p className="text-sm text-emerald-300">{imageMessage}</p> : null}
                  </div>
                </div>
                <div className="relative min-h-[220px] overflow-hidden rounded-[26px] border border-white/10 bg-[#071020]">
                  {form.coverImage ? (
                    <img alt="Preview de portada" className="h-full min-h-[220px] w-full object-cover" src={form.coverImage} />
                  ) : (
                    <div className="flex min-h-[220px] items-center justify-center px-6 text-center text-sm text-slate-500">
                      Selecciona una portada para ver el preview.
                    </div>
                  )}
                  {form.coverImage ? (
                    <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 text-xs text-slate-200 backdrop-blur-md">
                      {form.coverImage}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44,#549c24)]" />
              <div className="mb-5">
                <div className="section-kicker section-kicker--warm mb-3">Cuerpo</div>
                <h2 className="font-display text-3xl font-semibold text-white">Contenido del artículo</h2>
              </div>
              <RichTextEditor value={form.body} onChange={(value) => update("body", value)} />
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" variant={form.status === "published" ? "brandGreen" : "brandWarm"}>
                  {form.status === "published" ? "Guardar y publicar" : "Guardar borrador"}
                </Button>
                {publicPath ? (
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    href={publicPath}
                    target="_blank"
                  >
                    Ver post publicado
                  </Link>
                ) : null}
                {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
              </div>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="sticky top-8 space-y-6">
              <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045]">
                <div className="h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
                <div className="p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9de1e3]">Vista del post</div>
                      <h3 className="mt-2 font-display text-2xl font-semibold text-white">Resumen editorial</h3>
                    </div>
                    <StatusPill status={form.status} />
                  </div>

                  <div className="relative min-h-[220px] overflow-hidden rounded-[26px] border border-white/10 bg-[#071020]">
                    {form.coverImage ? (
                      <img alt={form.title || "Preview"} className="h-full min-h-[220px] w-full object-cover" src={form.coverImage} />
                    ) : (
                      <div className="flex min-h-[220px] items-center justify-center px-6 text-center text-sm text-slate-500">
                        Sin portada seleccionada.
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-[#b7e78c]">{form.category || "Sin categoría"}</div>
                    <div className="font-display text-3xl font-semibold leading-tight text-white">
                      {form.title || "Título del artículo"}
                    </div>
                    <p className="text-sm leading-7 text-slate-400">{form.excerpt || "El resumen aparecerá aquí."}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb0aa]">Checklist</div>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    { label: "Título", ok: Boolean(form.title.trim()) },
                    { label: "Slug", ok: Boolean(suggestedSlug) },
                    { label: "Resumen", ok: Boolean(form.excerpt.trim()) },
                    { label: "Portada", ok: Boolean(form.coverImage?.trim()) },
                    { label: "SEO title", ok: Boolean(form.seoTitle?.trim()) },
                    { label: "SEO description", ok: Boolean(form.seoDescription?.trim()) },
                    { label: "Contenido", ok: Boolean(form.body.trim()) }
                  ].map((item) => (
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3" key={item.label}>
                      <span className="text-slate-300">{item.label}</span>
                      <span className={item.ok ? "text-[#b7e78c]" : "text-[#ffb0aa]"}>
                        {item.ok ? "Listo" : "Falta"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {activeSection === "library" ? (
        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
            <div className="section-kicker section-kicker--green mb-3">Media local</div>
            <h2 className="font-display text-3xl font-semibold text-white">Biblioteca de imágenes del blog</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Estas imágenes viven localmente en `public/images/blog`. Puedes subir nuevas y luego usarlas como portada en cualquier post.
            </p>
            <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#549c24] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(84,156,36,0.28)] transition hover:bg-[#61aa31]">
              {isUploading ? "Subiendo..." : "Subir nueva imagen"}
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={isUploading}
                onChange={uploadCoverImage}
                type="file"
              />
            </label>
            {imageMessage ? <p className="mt-4 text-sm text-emerald-300">{imageMessage}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-400">
                No hay imágenes todavía.
              </div>
            ) : (
              images.map((image) => {
                const isSelected = form.coverImage === image.path;

                return (
                  <button
                    className={`group overflow-hidden rounded-[26px] border text-left transition ${
                      isSelected
                        ? "border-[#549c24]/70 bg-[#549c24]/10"
                        : "border-white/10 bg-white/[0.035] hover:border-[#78d5d7]/35"
                    }`}
                    key={image.path}
                    onClick={() => selectImage(image.path)}
                    type="button"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#071020]">
                      <img alt={image.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" src={image.path} />
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="truncate text-sm font-semibold text-white">{image.name}</div>
                      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>{formatFileSize(image.size)}</span>
                        <span>{formatAdminDate(image.updatedAt)}</span>
                      </div>
                      <div className="truncate text-xs text-slate-500">{image.path}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      {activeSection === "leads" ? (
        <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker section-kicker--cyan mb-3">Pipeline comercial</div>
              <h2 className="font-display text-3xl font-semibold text-white">Leads capturados</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">Contactos enviados desde el formulario del sitio.</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-slate-300">
              {sortedLeads.length} leads
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {sortedLeads.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 text-sm text-slate-400">
                No hay leads capturados todavía.
              </div>
            ) : (
              sortedLeads.map((lead) => (
                <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-5" key={lead.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-xl font-semibold text-white">{lead.name}</div>
                      <div className="mt-1 text-sm text-slate-400">{lead.company} · {lead.country}</div>
                    </div>
                    <span className="rounded-full border border-[#2e636b]/45 bg-[#2e636b]/16 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#9de1e3]">
                      {lead.preferredLanguage}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-300">
                    <div>{lead.email}</div>
                    <div>{lead.phone}</div>
                    <div>{lead.companyType} · {lead.size}</div>
                    <div>{lead.objective}</div>
                  </div>
                  <p className="mt-4 border-l border-[#e44c44]/70 pl-4 text-sm leading-7 text-slate-300">{lead.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
