# CLAUDE.md

Personal landing page + tech portfolio at [lyy0323.space](https://lyy0323.space).

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output → dist/
```

## Architecture

**Astro 5** static site with **React Islands** (partial hydration) + **Tailwind CSS** + **MDX** content collections.

### Key directories

```
src/
  pages/
    index.astro                    # Landing page
    feed.xml.ts                    # RSS feed
    tech/
      index.astro                  # /tech gallery
      projects/[slug].astro        # Project detail
      projects/index.astro         # Projects sub-gallery
      blog/[slug].astro            # Blog detail
      blog/index.astro             # Blog sub-gallery
      app/[slug].astro             # App redirect → phone ?open=slug
      app/index.astro              # /tech/app — VirtualPhone
  content/
    config.ts                      # Zod schemas for all 3 collections
    CONTRIBUTING.md                # ★ Agent guide for writing content — READ THIS FIRST for any content task
    projects/{slug}/index.mdx      # Folder-based projects
    blogs/{slug}.mdx               # Blog posts
    apps/{slug}.mdx                # App entries (metadata for phone)
  components/                      # React islands
  layouts/BaseLayout.astro         # Shared layout, injects InteractiveTerminal
  styles/global.css                # Terminal theme + scanline
public/
  apps/*.html                      # Static HTML apps loaded in phone iframe
```

### Content collections (src/content/config.ts)

Three collections share `baseFields` (title, description, tags, status, date, featured, pinned, order).

- **projects**: + `category` enum (website/app/game/data/art/agent/tool/other)
- **blogs**: base fields only
- **apps**: + `icon` (emoji), `embed` (URL to HTML), `folder` (optional grouping), `weight` (sort priority)

### Major components

| Component | What it does |
|-----------|-------------|
| `InteractiveTerminal.tsx` | Bottom command line with virtual filesystem. Accepts `projects: ProjectMeta[]` prop from BaseLayout. |
| `VirtualPhone.tsx` | iPhone-like device on /tech/app/. Shows folders + standalone apps. Apps open in iframe. Supports `?open=slug` deep-link. |
| `ContentGallery.tsx` | Filterable gallery for /tech. "App" tab is a link (not a filter) to /tech/app/. |
| `AboutSection.tsx` | Identity/career/education with expandable man pages, color-coded by org type. |
| `CareerGantt.tsx` | Career timeline Gantt chart. |
| `TerminalHero.tsx` | SSH boot animation on landing page. |
| `WorldsNav.tsx` | 4 world cards (writing/geo/tech/image). geo and image are disabled. |

### Design system

- **Colors**: 6 accent colors from permutations of `rgb(85, 119, 153)` — see tailwind.config.mjs
- **Background**: `#202026` body, `#1e1e24` surface
- **Fonts**: JetBrains Mono (code), LXGW (CJK)
- **Scanline**: `global.css` `.scanline::after` overlay at z-index 1

### Phone app system

Apps are self-contained HTML files in `public/apps/`. To add an app:

1. Drop HTML in `public/apps/{name}.html`
2. Create `src/content/apps/{name}.mdx` with frontmatter:
   ```yaml
   title: "..."
   description: "..."
   tags: [...]
   status: "active"
   date: "YYYY-MM"
   icon: "🎮"           # emoji for phone icon
   embed: "/apps/{name}.html"
   folder: "游戏"        # optional — groups into folder on phone
   weight: 3             # sort priority (higher = more prominent)
   ```
3. Phone homescreen auto-discovers. Folders sorted by total weight, then standalone apps by weight.
4. `/tech/app/{name}/` auto-redirects to phone with `?open={name}`.

### Adding content (projects / blogs)

Read `src/content/CONTRIBUTING.md` — it covers tone, structure, Q&A format, and the full agent workflow (scan → ask author → write → review).

Key points:
- Tone: conversational, not resume-like. Show thinking, not achievements.
- Projects go in `src/content/projects/{slug}/index.mdx`
- Blogs go in `src/content/blogs/{slug}.mdx`
- Always ask the author questions before writing a project page.
- `npm run build` must pass before considering done.

### Terminal filesystem

`InteractiveTerminal.tsx` builds a virtual FS from project metadata passed as props. It supports `ls`, `cd`, `cat`, `grep`, `open`, `whoami`, `neofetch`, pipe `|`, and easter eggs. `/geo/` and `/image/` are blocked directories.

### Deploy

GitHub Actions → GitHub Pages. Push to `main` triggers build + deploy. Proxy may be needed for push: `HTTPS_PROXY=http://127.0.0.1:7890 git push origin main`.

## Conventions

- Never commit secrets or .env files.
- `npm run build` must pass before any commit.
- Commit messages: concise, describe the "what" in imperative mood.
- Don't add unused dependencies or speculative abstractions.
- For UI changes, test in browser before reporting done.
