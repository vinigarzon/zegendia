# Zegendia Web

A bilingual Next.js marketing site and lightweight admin for the new Zegendia positioning:

- `Zegendia Core` for custom loyalty ecosystems
- `Oh My Rewards` for regional rewards fulfillment in LATAM
- `PuntosPlus` for the upcoming SaaS loyalty operating system

The project is optimized for Netlify deployment and uses structured content plus a simple admin workflow for blog posts and leads.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Framer Motion-ready component architecture
- MDX for seeded editorial content
- JSON content for site and product structure
- Netlify Blobs or local JSON for admin-managed posts and lead storage
- Resend for transactional email notifications

## Included MVP

- Bilingual home page
- About page
- Products overview
- Oh My Rewards product page
- PuntosPlus product page
- Club Santa Lucía case study
- Blog index and article pages
- Contact page with lead capture
- Admin login and dashboard skeleton
- SEO metadata, sitemap, and robots

## Project Structure

```text
src/
  app/
    api/
    admin/
    blog/
    case-studies/
    contact/
    en/
    products/
  components/
  content/
    admin/
    blog/
      es/
      en/
    case-studies/
      es/
      en/
    products/
    site/
  fonts/
public/
  images/
```

## Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Copy envs:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
pnpm dev
```

4. Verify:

```bash
pnpm typecheck
pnpm build
```

## Environment Variables

Use `.env.local` in development and configure the same values in Netlify:

```env
SITE_URL=https://www.zegendia.com
ADMIN_EMAIL=admin@zegendia.com
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=change-me-super-secret
RESEND_API_KEY=
RESEND_FROM=hello@zegendia.com
ZEGENDIA_SALES_EMAIL=info@zegendia.com
NETLIFY_DATABASE_MODE=local
```

### Notes

- `NETLIFY_DATABASE_MODE=local` stores admin posts and leads in `src/content/admin/*.json`.
- `NETLIFY_DATABASE_MODE=blobs` switches storage to Netlify Blobs for production-style persistence.
- If `RESEND_API_KEY` is missing, lead emails are skipped but lead storage still works.

## Content Editing

### Global marketing copy

Edit:

- `src/content/site/es.json`
- `src/content/site/en.json`
- `src/content/products/es.json`
- `src/content/products/en.json`

These files control:

- navigation
- footer
- homepage sections
- contact copy
- product page structure
- product messaging

### Seeded blog posts

Edit or add MDX files in:

- `src/content/blog/es/*.mdx`
- `src/content/blog/en/*.mdx`

Frontmatter fields:

- `title`
- `slug`
- `excerpt`
- `category`
- `tags`
- `date`
- `seoTitle`
- `seoDescription`
- `coverImage`
- `locale`
- `status`

### Case studies

Edit or add MDX files in:

- `src/content/case-studies/es/*.mdx`
- `src/content/case-studies/en/*.mdx`

## Admin Area

Routes:

- `/admin/login`
- `/admin`

Current admin capabilities:

- protected login using env credentials
- create or update blog posts
- save posts as backend-managed records
- upload local blog images to `public/images/blog`
- preview and select cover images from the admin image library
- view captured leads

### How admin blog posts work

- Seed content comes from MDX files.
- Admin-created posts are stored separately through the API.
- On the public blog, admin posts are merged with seeded posts by locale.
- In local development, uploaded blog images are written to `public/images/blog` and can be selected as a post `coverImage`.
- For Netlify, use a persistent storage/media strategy before relying on file uploads in production serverless functions.

## Contact / Leads

The contact form posts to:

- `POST /api/contact`

It currently:

- validates fields with Zod
- blocks simple honeypot spam
- stores the lead
- optionally sends internal notification email
- optionally sends bilingual confirmation email

Stored lead shape includes:

- name
- company
- email
- country
- phone / WhatsApp
- company type
- objective
- estimated size
- message
- preferred language

## Netlify Deployment

1. Push the repo to Git.
2. Create a new Netlify site from the repository.
3. Set environment variables in Netlify.
4. For production persistence, set:

```env
NETLIFY_DATABASE_MODE=blobs
```

5. Deploy with the default build command from `netlify.toml`:

```toml
[build]
  command = "pnpm build"
```

## Assets

Localized assets already included:

- `public/images/brand/zegendia-logo.png`
- migrated editorial blog images in `public/images/blog`
- custom SVG assets for OG and case-study visuals

The app does not hotlink to the current WordPress site.

## Future Expansion Ideas

- add solution pages for B2B loyalty, B2C loyalty, channel incentives, gamification, and developers
- add richer admin editing UX with markdown preview and a production media provider
- connect admin auth to a full identity provider if multi-user access is needed
- extend structured data with per-article `BlogPosting` and per-product `SoftwareApplication`
