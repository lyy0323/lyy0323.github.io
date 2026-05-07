# lyy0323.space

Terminal/Hacker 风格的个人 Landing Page + 技术作品集。

**Live:** [lyy0323.space](https://lyy0323.space) · **Tech:** [lyy0323.space/tech](https://lyy0323.space/tech/)

## Tech Stack

- **Astro 5** — 静态站点生成
- **React Islands** — 交互组件局部水合
- **Tailwind CSS** — 样式
- **MDX** — 内容管理（Content Collections）
- **GitHub Actions** — CI/CD → GitHub Pages

## Structure

```
src/
├── pages/
│   ├── index.astro                 # Landing page
│   └── tech/
│       ├── index.astro             # /tech gallery
│       ├── projects/[slug].astro   # Project detail
│       ├── blog/[slug].astro       # Blog detail
│       └── app/[slug].astro        # App detail
├── content/
│   ├── projects/{slug}/index.mdx   # Projects (folder-based)
│   ├── blogs/{slug}.mdx            # Blog posts
│   ├── apps/{slug}.mdx             # Interactive demos
│   └── CONTRIBUTING.md             # Agent onboarding guide
├── components/
│   ├── InteractiveTerminal.tsx      # Bottom terminal bar
│   ├── AboutSection.tsx             # Identity / career / education
│   ├── CareerGantt.tsx              # Career timeline chart
│   ├── TerminalHero.tsx             # SSH boot animation
│   ├── WorldsNav.tsx                # Worlds navigation cards
│   ├── ContentGallery.tsx           # Gallery with type + category filter
│   ├── ContentCard.tsx              # Item card
│   ├── Timeline.tsx                 # Vertical milestone timeline
│   ├── DiffView.tsx                 # Side-by-side comparison
│   └── MetricCounter.tsx            # Animated number counters
├── layouts/
│   └── BaseLayout.astro             # Shared layout + terminal injection
└── styles/
    └── global.css                   # Terminal theme + details styling
```

## Interactive Terminal

底部固定的命令行，支持：

| Command | Description |
|---------|-------------|
| `ls [-lah] [path]` | List directory contents |
| `cd <dir>` | Navigate (relative/absolute paths, cwd-based) |
| `cat <file>` | Print file (index.mdx reads page DOM) |
| `grep <field> index.mdx` | Extract frontmatter field |
| `grep <section> about.md` | Extract about section (career/education/etc.) |
| `whoami` | Identity |
| `open <url>` | Open external URL |
| `cmd1 \| cmd2` | Pipe (e.g. `grep url index.mdx \| open`) |
| `neofetch` | System summary |

Easter eggs: `sudo`, `rm -rf /`, `vim`, `exit`, `ssh`, `su`, `brew install`...

## Content Types

### Projects (`/tech/projects/`)
Folder-based: `src/content/projects/{slug}/index.mdx`. Each project page supports MDX components (Timeline, DiffView, MetricCounter) and `<details>` Q&A sections.

### Blog (`/tech/blog/`)
Standalone articles: `src/content/blogs/{slug}.mdx`. Tech notes and reflections not tied to a specific project.

### App (`/tech/app/`)
Interactive demos (planned): `src/content/apps/{slug}.mdx`.

## Adding Content

See [`src/content/CONTRIBUTING.md`](src/content/CONTRIBUTING.md) for the full agent onboarding guide. TL;DR:

1. Create `src/content/projects/{slug}/index.mdx` (or `blogs/{slug}.mdx`)
2. Add frontmatter (title, description, tags, date, status, category)
3. Write content in conversational tone with Q&A section
4. `npm run build` — terminal auto-discovers new content

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # Static output → dist/
npm run preview  # Preview built site
```

## Design

- **Colors:** 6 accent colors from permutations of `rgb(85, 119, 153)`
- **Background:** `#202026` (body), `#1e1e24` (terminal surface)
- **Text:** `#c8ccd0` (reduced contrast for readability)
- **Fonts:** JetBrains Mono (code), LXGW (CJK)

## License

© 2024-2026 lyy0323
