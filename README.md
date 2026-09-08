# Academic Portfolio & Technical Blog

A fast, minimalist, academic-style personal portfolio and technical blog built with [Astro](https://astro.build/) and TypeScript. Designed specifically for academic researchers, graduate students, and software engineers who prefer clean typography and high signal-to-noise over visual spectacle.

Targeted for deployment on **GitHub Pages**.

---

## Features

- **Minimalist Academic Aesthetic**: High-contrast, typography-focused design inspired by university faculty pages and text-focused technical sites.
- **Three Core Pages**:
  1. **Home (`/`)**: Brief introduction, about section, research/technical interests, selected projects, and latest writing.
  2. **Resume (`/resume`)**: Full academic CV adhering strictly to authentic experience, printable with clean print CSS (`@media print` that hides navigation, formats text in pure monochrome, and optimizes margins for PDF export).
  3. **Blog (`/blog`)**: Content collections powered by Markdown/MDX with frontmatter, reading-time calculation, tag filtering, and syntax highlighting.
- **Zero Bloat**: No UI component frameworks, no heavy runtime JS, no analytics or tracking scripts. Blazing fast load times.
- **GitHub Pages Ready**: Automated GitHub Actions workflow (`.github/workflows/deploy.yml`) handles static site generation and deployment upon pushing to `main`.

---

## Directory Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions deployment workflow
├── public/
│   ├── favicon.svg               # Academic monogram favicon
│   └── robots.txt                # Search crawler directive
├── src/
│   ├── components/
│   │   ├── Header.astro          # Site header and navigation
│   │   ├── Footer.astro          # Clean understated footer
│   │   └── PostPreview.astro     # Blog item summary component
│   ├── content/
│   │   ├── blog/                 # Markdown blog articles
│   │   │   ├── peft-low-resource-nmt.md
│   │   │   ├── vector-search-pgvector.md
│   │   │   └── audio-vad-preprocessing.md
│   │   └── config.ts             # Blog content schema (Zod)
│   ├── layouts/
│   │   ├── BaseLayout.astro      # Master HTML shell with SEO meta tags
│   │   └── BlogPostLayout.astro  # Article layout with reading time and tags
│   ├── pages/
│   │   ├── index.astro           # Homepage
│   │   ├── resume.astro          # Academic CV page
│   │   └── blog/
│   │       ├── index.astro       # Blog archive (grouped by date)
│   │       └── [...slug].astro   # Dynamic blog article renderer
│   ├── styles/
│   │   ├── global.css            # Global typography and layout rules
│   │   └── print.css             # Print-to-PDF stylesheet
│   └── config.ts                 # Central site configuration (metadata, links)
├── astro.config.mjs              # Astro configuration (base path, site URL)
├── package.json
└── tsconfig.json
```

---

## Getting Started Locally

### 1. Install Dependencies

Ensure you have [Node.js](https://nodejs.org/) (v18.14.1 or higher) installed. Then run:

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` in your browser.

### 3. Build for Production

To create a static production build in the `./dist` folder:

```bash
npm run build
```

To preview the built static site locally:

```bash
npm run preview
```

---

## Writing Blog Posts

To publish a new article, create a new `.md` file under `src/content/blog/`:

```bash
touch src/content/blog/my-new-post.md
```

Add the required frontmatter at the top:

```markdown
---
title: "Understanding Memory Hierarchies"
description: "A short note on CPU cache lines, TLB misses, and virtual memory."
pubDate: 2026-09-09
tags:
  - systems
  - hardware
draft: false
---

Your content goes here. You can use standard Markdown, code blocks with syntax highlighting, tables, and blockquotes.
```

- If `draft: true`, the post will be hidden from production builds.
- Posts are automatically sorted by `pubDate` in reverse chronological order.

---

## Customizing Personal Information

All personal details, URLs, and social links are centralized in:

📁 `src/config.ts`

```typescript
export const SITE = {
  title: "Soumyak Pransuman Behera",
  author: "Soumyak Pransuman Behera",
  headline: "Computer Science undergraduate and researcher working on machine learning, natural language processing, and systems.",
  email: "behera.soumyak05@gmail.com",
  github: "https://github.com/mkdir-smyk",
  linkedin: "https://linkedin.com/in/soumyak-p-behera",
  siteUrl: "https://mkdir-smyk.github.io",
  ...
};
```

To modify your resume details, update [src/pages/resume.astro](file:///s:/smyk/Dev/New%20folder/src/pages/resume.astro).

---

## Deploying to GitHub Pages

### Option A: User / Organization Page (`https://<username>.github.io`)
If your repository is named `<username>.github.io`:
1. Keep `base: '/'` in `astro.config.mjs`.
2. Push code to the `main` branch.
3. In your GitHub repository settings, go to **Settings > Pages**.
4. Under **Build and deployment > Source**, select **GitHub Actions**.
5. The included workflow `.github/workflows/deploy.yml` will automatically build and deploy the site.

### Option B: Project Page (`https://<username>.github.io/<repo-name>`)
If your repository is named something like `portfolio`:
1. Open `astro.config.mjs` and set:
   ```javascript
   export default defineConfig({
     site: 'https://<username>.github.io',
     base: '/<repo-name>/',
     ...
   });
   ```
2. Push to `main`. The deployment workflow will automatically deploy to GitHub Pages under that subpath.

---

## Printing the Resume to PDF

1. Navigate to `/resume` in your browser.
2. Click the **"⎙ Print / Save as PDF"** button (or press `Ctrl+P` / `Cmd+P`).
3. In the print dialog, choose **"Save as PDF"**.
4. The print stylesheet will automatically strip the navigation header, print button, and footer, leaving a crisp, monochrome academic resume with clean margins.
