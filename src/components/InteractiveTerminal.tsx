import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface HistoryEntry { type: 'input' | 'output'; text: string }
interface TerminalState { expanded: boolean; history: HistoryEntry[]; cmdHistory: string[] }

const STORAGE_KEY = 'terminal-state';
const CONSUMED_KEY = 'terminal-state-consumed';
function saveState(s: TerminalState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    sessionStorage.removeItem(CONSUMED_KEY);
  } catch {}
}
function loadState(): TerminalState | null {
  try {
    if (sessionStorage.getItem(CONSUMED_KEY)) return null;
    const r = sessionStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}
function consumeState() {
  try { sessionStorage.setItem(CONSUMED_KEY, '1'); } catch {}
}

// ── data ──

interface ProjectMeta {
  slug: string; title: string; description: string; category: string;
  tags: string[]; status: string; date: string; url?: string; repo?: string;
}

interface CareerEntry { org: string; role: string; period: string; details: string[] }
const CAREER: CareerEntry[] = [
  { org: 'MiniMax', role: '视觉产品组 · Talkie/星野', period: '2026.02→now', details: ['Talkie/星野卡牌体系重构', '（详细内容待补充）'] },
  { org: '字节跳动 Seedream', role: 'AI PM · 生图模型评测', period: '2025.11→2026.02', details: ['设计四层树状评估框架，拆分推理能力与生成质量', '用 Shifted Harmonic Mean 聚合算分，短板效应防止高分掩盖缺陷', '方案未采纳，后 reasoning DiT 上线时美学质量下滑验证了方案价值', '另负责用户反馈数据分析与看板建设'] },
  { org: '蔚来能源', role: 'AI PM', period: '2025.09→11', details: ['优化销售渠道 AI Agent：问答准确率 15% → 80%', '诊断知识库质量问题，重构为"服务诀窍 QA + 产品事实 JSON"双轨', '主导部门数据治理：统一三张分散表的数据源，搭建自动化看板'] },
  { org: '知识竞争力研究中心', role: '研究员（横向）', period: '2025.10→now', details: ['智库研究与政策咨询 — AI 方向', '《前沿领域动态》内参"人工智能"板块首席撰稿人', '参与区域创新能力评估、AI 产业政策研究'] },
  { org: '上海交大国学社', role: '社长→技术部创始人', period: '2021→now', details: ['社长 2021.09~2022.08 / 乐府部创始人 2021.12 / 技术部创始人 2025.09', '社员诗歌网站 PM (190w+ 访问)，社团数字化转型带头人', '"灵枢" 智能知识中枢与决策辅助 Agent 全栈开发', '第六届上海高校国学挑战赛总策划、总导演，规模较往届扩大 180%', '《南洋集》册七责编，《南洋精选集》首席编辑'] },
];

const EDUCATION: CareerEntry[] = [
  { org: '上海交通大学', role: '硕士 · 应用经济学', period: '2024.09→2027.03(预)', details: ['安泰经管学院 · 科学学研究 · AI SciSci', '导师：罗守贵', '上海市软科学研究基地研究员', '《前沿领域动态》内参"人工智能"板块首席撰稿人'] },
  { org: '上海交通大学', role: '学士 · 经济学 + 大数据管理', period: '2020.09→2024.06', details: ['安泰经管学院 · 经济学 + 大数据管理与应用', 'Score: 87.33/100，对标数学系课程体系', '满绩：计量经济学、Python、数据采集和可视化、建模与优化、商务统计学', '90+：心理与行为、博弈论、MATLAB、组织行为学、金融学、线性代数'] },
  { org: '上海市延安中学', role: '高中', period: '2017.09→2020.07', details: ['选考：物理/化学/地理', '任班长，首创班刊总策划，成书四册', '2020 年校高考状元'] },
];

const PUBLICATIONS = [
  'Neo-Classic (ACL 2026 Main, 第一作者) → /tech/projects/neo-classic/',
  'Deconstructing Positional Information (ICLR 2026 Main) → https://arxiv.org/abs/2505.13027',
];

const ABOUT_SECTIONS: Record<string, { items: CareerEntry[] } | { lines: string[] }> = {
  career: { items: CAREER },
  education: { items: EDUCATION },
  publication: { lines: PUBLICATIONS },
  interests: { lines: ['诗词 · 音乐创作 · Python · 语言学 · 数字人文 · 荣格心理学 · 酷儿理论 · 文创设计'] },
  social: { lines: ['xiaohongshu    @芋泥椰子冻', 'netease_music  @林雨夜 (歌手)', 'github         @lyy0323  → https://github.com/lyy0323'] },
};

// ── filesystem ──

interface FsEntry { name: string; isDir: boolean; size: number; date: string }

function buildFs(projects: ProjectMeta[]) {
  const fs: Record<string, FsEntry[]> = {
    '/': [
      { name: 'writing/', isDir: true, size: 4096, date: 'Feb 15' },
      { name: 'geo/', isDir: true, size: 4096, date: 'Feb 15' },
      { name: 'tech/', isDir: true, size: 4096, date: 'May 06' },
      { name: 'image/', isDir: true, size: 4096, date: 'May 07' },
    ],
    '/tech/': [
      { name: 'projects/', isDir: true, size: 4096, date: 'May 06' },
      { name: 'blog/', isDir: true, size: 4096, date: 'May 06' },
      { name: 'app/', isDir: true, size: 4096, date: 'May 06' },
    ],
    '/tech/projects/': projects.map(p => ({ name: p.slug + '/', isDir: true, size: 4096, date: p.date.replace('-', ' ') })),
    '/tech/blog/': [],
    '/tech/app/': [],
  };
  for (const p of projects) {
    fs[`/tech/projects/${p.slug}/`] = [
      { name: 'index.mdx', isDir: false, size: 4200 + p.slug.length * 300, date: p.date.replace('-', ' ') },
    ];
  }
  return fs;
}

function buildDirs(fs: Record<string, FsEntry[]>, projects: ProjectMeta[]) {
  const dirs = new Set(Object.keys(fs));
  for (const p of projects) dirs.add(`/tech/projects/${p.slug}/`);
  dirs.add('/writing/'); dirs.add('/geo/'); dirs.add('/image/');
  return dirs;
}

const HIDDEN_FS: Record<string, FsEntry[]> = {
  '/': [
    { name: '.social', isDir: false, size: 186, date: 'Feb 06' },
    { name: '.gitconfig', isDir: false, size: 94, date: 'Nov 24' },
    { name: 'about.md', isDir: false, size: 2840, date: 'May 07' },
    { name: 'motto.txt', isDir: false, size: 72, date: 'Feb 06' },
    { name: 'CNAME', isDir: false, size: 15, date: 'Nov 24' },
  ],
  '/tech/projects/': [
    { name: '.contributing.md', isDir: false, size: 8420, date: 'May 06' },
  ],
};

function humanSize(b: number): string {
  if (b < 1024) return `${b}`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}K`;
  return `${(b / 1048576).toFixed(1)}M`;
}

// ── path ──

function norm(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const r: string[] = [];
  for (const p of parts) { if (p === '.') continue; if (p === '..') { r.pop(); continue; } r.push(p); }
  return '/' + (r.length ? r.join('/') + '/' : '');
}
function resolve(cwd: string, target: string): string {
  if (target.startsWith('/')) return norm(target);
  return norm(cwd + '/' + target);
}

interface FsCtx {
  fs: Record<string, FsEntry[]>;
  dirs: Set<string>;
  projects: ProjectMeta[];
}

function isDir(ctx: FsCtx, path: string) { return ctx.dirs.has(path); }
function isFile(ctx: FsCtx, dir: string, name: string): boolean {
  const entries = [...(ctx.fs[dir] ?? []), ...(HIDDEN_FS[dir] ?? [])];
  return entries.some(e => !e.isDir && e.name === name);
}

function getProjectForDir(ctx: FsCtx, dir: string): ProjectMeta | undefined {
  const m = dir.match(/^\/tech\/projects\/([^/]+)\/$/);
  return m ? ctx.projects.find(p => p.slug === m[1]) : undefined;
}

// ── help ──

const HELP_TEXT = `Available commands:

  Filesystem
    ls [-lah] [path]        List directory contents
    cd <dir>                Change directory (directories only)
    pwd / cwd               Print working directory
    cat <file>              Print file contents (relative to cwd)

  About (in ~ root)
    whoami                  Identity summary
    grep <section> about.md Extract section from about.md
      sections: identity, career, education, publication, interests, social
    grep career about.md | more $N   Expand entry N

  Project (in project dir)
    grep <field> index.mdx  Extract frontmatter field
    grep qa index.mdx | more $N     Expand Q&A entry N
    grep url index.mdx | open       Open project live site

  Navigation
    open <url>              Open external URL in browser

  System
    date        neofetch        clear        help

  Operators
    cmd1 | cmd2         Pipe output to next command`;

function getNeofetch(projectCount: number) {
  return `        ██╗   ██╗     yuye@lyy0323.space
        ╚██╗ ██╔╝     ─────────────────
         ╚████╔╝      OS: Astro 5 / GitHub Pages
          ╚██╔╝       Shell: zsh + JetBrains Mono
           ██║        Role: AI Product Manager
           ╚═╝        Location: 上海
                      Type: INTJ · 4w5 · sx/so
  ───────────────      Uptime: since 2024-11
  lyy0323.space       Packages: writing, geo, tech
                      Projects: ${projectCount} indexed`;
}

// ── command execution ──

interface CmdResult {
  output: string[];
  navigate?: string;
  expandable?: { label: string; details: string[] }[];
  pipedText?: string;
  error?: boolean;
}

function parseLsFlags(args: string[]): { flags: Set<string>; target: string | null } {
  const flags = new Set<string>(); let target: string | null = null;
  for (const a of args) { if (a.startsWith('-')) { for (const ch of a.slice(1)) flags.add(ch); } else { target = a; } }
  return { flags, target };
}

function executeCommand(input: string, cwd: string, ctx: FsCtx, piped?: { expandable?: { label: string; details: string[] }[]; text?: string }): CmdResult {
  const trimmed = input.trim();
  if (!trimmed) return { output: [] };
  const [cmd, ...args] = trimmed.split(/\s+/);
  const arg = args.join(' ');

  // ── easter eggs ──
  if (cmd === 'sudo') return { output: [`${arg || 'sudo'}: yuye is not in the sudoers file. This incident will be reported.`] };
  if (cmd === 'rm') return { output: [arg.includes('-r') ? 'rm: permission denied. nice try though :)' : 'rm: read-only file system'] };
  if (['chmod', 'chown', 'chgrp'].includes(cmd)) return { output: [`${cmd}: operation not permitted (read-only filesystem)`] };
  if (['kill', 'killall', 'pkill'].includes(cmd)) return { output: [`${cmd}: sending signal to PID ${arg || '1'}: Operation not permitted`] };
  if (cmd === 'shutdown' || cmd === 'reboot' || cmd === 'poweroff') return { output: [`${cmd}: must be superuser. also, please don't.`] };
  if (['dd', 'mkfs', 'fdisk', 'parted'].includes(cmd)) return { output: [`${cmd}: access denied — this is a static site, not a block device`] };
  if (cmd === 'curl' || cmd === 'wget') return { output: [`${cmd}: network access denied. try 'open' instead.`] };
  if (cmd === 'vim' || cmd === 'nano' || cmd === 'vi' || cmd === 'emacs') return { output: [`${cmd}: read-only filesystem. but I appreciate the intent.`] };
  if (cmd === 'exit' || cmd === 'logout') return { output: ['logout', 'Connection to lyy0323.space closed.', '', '...just kidding. press Esc to collapse.'] };
  if (trimmed === ':(){ :|:& };:' || trimmed.includes('fork')) return { output: ['bash: fork: Resource temporarily unavailable', '(fork bomb detected and neutralized. cute.)'] };
  if (cmd === 'su') return { output: ['su: Authentication failure', '(there is no root here. only 芋椰.)'] };
  if (['apt', 'yum', 'brew', 'pacman', 'dnf'].includes(cmd)) return { output: [`${cmd}: this is not that kind of terminal. but I'm flattered you tried.`] };
  if (cmd === 'ssh') return { output: [`ssh: connect to host ${arg || 'localhost'}: Connection refused`, '(you\'re already here!)'] };

  switch (cmd) {
    case 'help': case '--help': case '-h':
      return { output: HELP_TEXT.split('\n') };

    // ── ls ──
    case 'ls': {
      const { flags, target: lsTarget } = parseLsFlags(args);
      const resolved = lsTarget ? resolve(cwd, lsTarget) : cwd;
      if (!isDir(ctx, resolved)) return { output: [`ls: ${lsTarget || resolved}: No such file or directory`], error: true };
      const showHidden = flags.has('a');
      const showLong = flags.has('l');
      const showHuman = flags.has('h');
      const items = ctx.fs[resolved] ?? [];
      const hidden = showHidden ? (HIDDEN_FS[resolved] ?? []) : [];
      const dotDirs: FsEntry[] = showHidden
        ? [{ name: '.', isDir: true, size: 4096, date: 'May 06' }, { name: '..', isDir: true, size: 4096, date: 'May 06' }]
        : [];
      const all = [...dotDirs, ...hidden, ...items];
      if (!showLong) {
        if (all.length === 0) return { output: ['  (empty)'] };
        const rows: string[] = [];
        for (let i = 0; i < all.length; i += 4) rows.push(all.slice(i, i + 4).map(x => x.name.padEnd(20)).join(''));
        return { output: rows };
      }
      const lines = [`total ${all.length}`];
      for (const e of all) {
        const perm = e.isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const sz = e.isDir ? (showHuman ? '4.0K' : '4096') : (showHuman ? humanSize(e.size) : String(e.size));
        const proj = ctx.projects.find(p => p.slug + '/' === e.name);
        const extra = proj ? `  ${proj.category.padEnd(8)} ${proj.status}` : '';
        lines.push(`${perm}  ${sz.padStart(showHuman ? 5 : 6)}  ${e.date.padEnd(7)} ${e.name}${extra}`);
      }
      return { output: lines };
    }

    // ── cd (directories only) ──
    case 'cd': {
      if (!arg || arg === '~') {
        if (cwd === '/') return { output: [] };
        return { output: ['→ /'], navigate: '/' };
      }
      if (arg === 'index.mdx') return { output: ['cd: not a directory: index.mdx'], error: true };
      const dest = resolve(cwd, arg);
      if (dest === cwd) return { output: [] };
      const blockedDirs: Record<string, string> = {
        '/geo/': 'cd: geo/: 施工中……预计 2027 年开通',
        '/image/': 'cd: image/: 图像传输中，暂不可访问',
      };
      if (blockedDirs[dest]) return { output: [blockedDirs[dest]], error: true };
      if (isDir(ctx, dest)) return { output: [`→ ${dest}`], navigate: dest };
      const asFile = dest.replace(/\/$/, '');
      if (isFile(ctx, cwd, asFile.split('/').pop() || '')) return { output: [`cd: not a directory: ${arg}`], error: true };
      return { output: [`cd: no such directory: ${arg}`, `  try: cd tech/projects/poem-site`], error: true };
    }

    // ── open (external URLs only) ──
    case 'open': {
      const url = arg || piped?.text;
      if (!url) return { output: ['Usage: open <url>', '  e.g. open https://example.com', '  or: grep url index.mdx | open'], error: true };
      if (!url.startsWith('http')) return { output: [`open: not a URL: ${url}`, '  open only supports http/https URLs', '  use cd to navigate within the site'], error: true };
      window.open(url, '_blank');
      return { output: [`→ opened ${url} in new tab`] };
    }

    case 'pwd': case 'cwd':
      return { output: [cwd] };

    // ── cat (relative to cwd) ──
    case 'cat': {
      if (!arg) return { output: ['Usage: cat <file>', '  e.g. cat index.mdx, cat motto.txt (in ~)'], error: true };

      // index.mdx — print page content as text
      if (arg === 'index.mdx') {
        if (!isFile(ctx, cwd, 'index.mdx')) return { output: [`cat: index.mdx: No such file (not in a content directory)`], error: true };
        const prose = document.querySelector('.prose');
        if (!prose) return { output: ['cat: index.mdx: could not read content'], error: true };
        const text = prose.textContent?.trim() ?? '';
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        return { output: lines.length > 0 ? lines : ['(empty)'] };
      }

      // resolve relative path: check if the file exists in cwd
      if (arg === 'motto.txt' && cwd === '/') return { output: ['「至此春温能想象，从来寒夜可倾怀。」'] };
      if (arg === '.social' && cwd === '/') return { output: ['xiaohongshu    @芋泥椰子冻', 'netease_music  @林雨夜 (歌手)', 'github         @lyy0323  → https://github.com/lyy0323'] };
      if (arg === 'motto.txt' || arg === '.social') return { output: [`cat: ${arg}: No such file (only available in ~)`], error: true };

      if (isFile(ctx, cwd, arg)) return { output: [`(binary or non-text file: ${arg})`] };
      return { output: [`cat: ${arg}: No such file`], error: true };
    }

    // ── grep ──
    case 'grep': {
      if (args.length < 2) {
        return { output: ['Usage: grep <field> <file>', '  grep <section> about.md    (career, education, publication, interests, social)', '  grep <field> index.mdx     (title, url, qa, ...)'], error: true };
      }
      const field = args[0];
      const file = args[1];

      // ── grep ... about.md ──
      if (file === 'about.md') {
        if (cwd !== '/') return { output: ['grep: about.md: only available in ~ (root directory)'], error: true };

        if (field === 'identity') {
          return { output: [
            '## Identity',
            '  name: (preferred) 林雨夜 | Yuye[y\'jɛ:] | 芋椰 | 椰椰 | Coco',
            '         (assigned) 张　含 | Han Zhang',
            '  type: INTJ · 4w5 · 415 · sx/so · EII',
            '  location: 上海 Shanghai',
          ] };
        }

        const section = ABOUT_SECTIONS[field];
        if (!section) {
          return { output: [`grep: '${field}' not found in about.md`, '  sections: identity, career, education, publication, interests, social'], error: true };
        }

        if ('lines' in section) {
          return { output: [`## ${field.charAt(0).toUpperCase() + field.slice(1)}`, ...section.lines.map(l => `  ${l}`)] };
        }

        // expandable items (career, education)
        const items = section.items;
        const lines = items.map((c, i) => `  $${i}  ${c.period.padEnd(20)} ${c.org} — ${c.role}`);
        return {
          output: [`## ${field.charAt(0).toUpperCase() + field.slice(1)}`, ...lines],
          expandable: items.map(c => ({ label: c.org, details: c.details })),
        };
      }

      // ── grep ... index.mdx ──
      if (file !== 'index.mdx') {
        return { output: [`grep: ${file}: unsupported file`, '  supported: about.md (in ~), index.mdx (in project dir)'], error: true };
      }

      const proj = getProjectForDir(ctx, cwd);

      if (field === 'qa') {
        const details = document.querySelectorAll('details');
        if (details.length === 0) return { output: ['grep: no Q&A found in index.mdx'], error: true };
        const qitems: { label: string; details: string[] }[] = [];
        const qlines: string[] = [];
        details.forEach((d, i) => {
          const summary = d.querySelector('summary')?.textContent?.trim() ?? `Item ${i}`;
          qlines.push(`  $${i}  ${summary}`);
          const content = d.querySelector(':scope > :not(summary)')?.textContent?.trim() ?? '';
          qitems.push({ label: summary, details: content.split('\n').map(l => l.trim()).filter(Boolean) });
        });
        return { output: qlines, expandable: qitems };
      }

      if (!proj) return { output: ['grep: index.mdx not found (cd to a project dir first)'], error: true };

      const fieldMap: Record<string, string | undefined> = {
        title: proj.title, description: proj.description, url: proj.url, repo: proj.repo,
        category: proj.category, status: proj.status, date: proj.date,
        tags: proj.tags.join(', '),
      };

      if (!(field in fieldMap)) {
        return { output: [`grep: unknown field '${field}'`, '  index.mdx fields: title, description, url, repo, category, tags, status, date, qa'], error: true };
      }

      const val = fieldMap[field];
      if (!val) return { output: [`${field}: (not set)`], error: true };
      return { output: [`${val}`], pipedText: val };
    }

    case 'whoami':
      return { output: [
        'name: (preferred) 林雨夜 | Yuye[y\'jɛ:] | 芋椰 | 椰椰 | Coco',
        '       (assigned) 张　含 | Han Zhang',
        'type: INTJ · 4w5 · 415 · sx/so · EII',
        'location: 上海 Shanghai',
        '',
        'more: grep <section> about.md',
        '  sections: career, education, publication, interests, social',
      ] };

    case 'echo':
      if (arg === '$INTERESTS') return { output: ['诗词 · 音乐创作 · Python · 语言学 · 数字人文 · 荣格心理学 · 酷儿理论 · 文创设计'] };
      if (!arg) return { output: [''], error: false };
      return { output: [arg.replace(/^\$/, '')] };

    case 'history': {
      if (arg === '--career') {
        return { output: [
          'history --career: deprecated. use:',
          '  grep career about.md',
          '  grep career about.md | more $N',
        ], error: true };
      }
      return { output: ['Usage: grep <section> about.md', '  sections: career, education, publication, interests, social'], error: true };
    }

    case 'more': {
      if (!arg) return { output: ['Usage: more $N', '  e.g. grep qa index.mdx | more $0', '  e.g. history --career | more $1'], error: true };
      if (!arg.startsWith('$')) return { output: [`more: expected $N, got '${arg}'`], error: true };
      const idx = parseInt(arg.slice(1), 10);
      if (isNaN(idx)) return { output: [`more: invalid index: ${arg}`], error: true };
      if (!piped?.expandable) return { output: ['more: no piped data. use with pipe:', '  grep qa index.mdx | more $0'], error: true };
      if (idx < 0 || idx >= piped.expandable.length) return { output: [`more: $${idx} out of range (0-${piped.expandable.length - 1})`], error: true };
      const item = piped.expandable[idx];
      return { output: [`── ${item.label} ──`, ...item.details.map(l => `  ${l}`)] };
    }

    case 'date':
      return { output: [new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'long' })] };
    case 'neofetch':
      return { output: getNeofetch(ctx.projects.length).split('\n') };
    case 'clear':
      return { output: ['__CLEAR__'] };

    // removed standalone 'qa' — use 'grep qa index.mdx' instead
    case 'qa':
      return { output: ['qa: command moved. use:', '  grep qa index.mdx', '  grep qa index.mdx | more $N'], error: true };

    default:
      return { output: [`command not found: ${cmd}. Type 'help' for available commands.`], error: true };
  }
}

// ── component ──

export default function InteractiveTerminal({ projects }: { projects: ProjectMeta[] }) {
  const fs = useMemo(() => buildFs(projects), [projects]);
  const dirs = useMemo(() => buildDirs(fs, projects), [fs, projects]);
  const ctx: FsCtx = useMemo(() => ({ fs, dirs, projects }), [fs, dirs, projects]);

  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [restored, setRestored] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const cwd = typeof window !== 'undefined' ? norm(window.location.pathname) : '/';

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setExpanded(saved.expanded);
      setHistory(saved.history);
      setCmdHistory(saved.cmdHistory);
      consumeState();
    } else {
      if (window.location.pathname === '/') setExpanded(true);
    }
    setRestored(true);
  }, []);
  const scrollToBottom = useCallback(() => { if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight; }, []);
  useEffect(() => { scrollToBottom(); }, [history, scrollToBottom]);
  useEffect(() => { if (expanded && inputRef.current) inputRef.current.focus(); }, [expanded]);

  const navigateTo = useCallback((dest: string, newHist: HistoryEntry[], newCmd: string[]) => {
    saveState({ expanded: true, history: newHist, cmdHistory: newCmd });
    window.location.href = dest;
  }, []);

  const runSegment = useCallback((segment: string) => {
    const parts = segment.split('|').map(s => s.trim()).filter(Boolean);
    let lastOutput: string[] = [];
    let nav: string | undefined;
    let currentPiped: { expandable?: { label: string; details: string[] }[]; text?: string } = {};
    let hadError = false;

    for (const part of parts) {
      const result = executeCommand(part, cwd, ctx, currentPiped);
      lastOutput = result.output;
      if (result.navigate) nav = result.navigate;
      currentPiped = {
        expandable: result.expandable ?? currentPiped.expandable,
        text: result.pipedText ?? (result.output.length === 1 ? result.output[0] : undefined),
      };
      if (result.error) { hadError = true; break; }
    }
    return { output: lastOutput, navigate: nav, error: hadError };
  }, [cwd]);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    const r = runSegment(input.trim());
    const allOutput = r.output;
    const nav = r.navigate;

    if (allOutput.length === 1 && allOutput[0] === '__CLEAR__') {
      setHistory([]); setInput('');
      setCmdHistory(prev => [...prev, input]); setHistoryIdx(-1);
      return;
    }

    const newHist = [...history, { type: 'input' as const, text: input }, ...allOutput.map(l => ({ type: 'output' as const, text: l }))];
    const newCmd = [...cmdHistory, input];

    if (nav) {
      setHistory(newHist); setCmdHistory(newCmd); setInput('');
      setTimeout(() => navigateTo(nav!, newHist, newCmd), 300);
      return;
    }
    setHistory(newHist); setCmdHistory(newCmd); setHistoryIdx(-1); setInput('');
  }, [input, history, cmdHistory, navigateTo, runSegment]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter') { handleSubmit(); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (cmdHistory.length > 0) { const n = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1); setHistoryIdx(n); setInput(cmdHistory[n]); } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (historyIdx >= 0) { const n = historyIdx + 1; if (n >= cmdHistory.length) { setHistoryIdx(-1); setInput(''); } else { setHistoryIdx(n); setInput(cmdHistory[n]); } } }
    else if (e.key === 'Escape') { setExpanded(false); }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setHistory([]); }
  }, [handleSubmit, cmdHistory, historyIdx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!expanded && e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const t = (e.target as HTMLElement)?.tagName;
        if (t !== 'INPUT' && t !== 'TEXTAREA') { e.preventDefault(); setExpanded(true); }
      }
    };
    const openHandler = () => setExpanded(true);
    window.addEventListener('keydown', h);
    window.addEventListener('open-terminal', openHandler);
    return () => { window.removeEventListener('keydown', h); window.removeEventListener('open-terminal', openHandler); };
  }, [expanded]);

  const cwdDisplay = cwd === '/' ? '~' : cwd.replace(/\/$/, '');

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[9998] transition-all duration-300 ${expanded ? 'h-[45vh] sm:h-[40vh]' : 'h-10'}`}>
      <div className="flex items-center gap-2 px-4 py-2 bg-terminal-surface border-t border-terminal-border cursor-pointer select-none h-10" onClick={() => setExpanded(!expanded)}>
        <div className="terminal-dot bg-red-500 !w-2 !h-2" />
        <div className="terminal-dot bg-yellow-500 !w-2 !h-2" />
        <div className="terminal-dot bg-green-500 !w-2 !h-2" />
        <span className="text-[10px] text-terminal-muted ml-1 flex-1">
          {expanded ? `terminal — ${cwdDisplay} — click or Esc to collapse` : `${cwdDisplay} — press / to open terminal`}
        </span>
        <span className={`text-terminal-muted text-[10px] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▲</span>
      </div>
      {expanded && (
        <div className="flex flex-col h-[calc(100%-2.5rem)] bg-terminal-bg">
          <div ref={outputRef} className="flex-1 overflow-y-auto px-4 py-3 text-xs sm:text-sm font-mono space-y-0.5">
            {history.length === 0 && <div className="text-terminal-muted text-xs">Type <span className="text-terminal-cyan">help</span> for available commands.</div>}
            {history.map((e, i) => (
              <div key={i} className={e.type === 'input' ? 'text-terminal-text' : 'text-terminal-muted whitespace-pre-wrap break-words'}>
                {e.type === 'input' && <span className="prompt-symbol mr-1">❯</span>}
                {e.type === 'input' ? <span className="cmd-text">{e.text}</span> : <span>{e.text}</span>}
              </div>
            ))}
          </div>
          <div className="flex items-center px-4 py-2 border-t border-terminal-border bg-terminal-surface shrink-0">
            <span className="text-terminal-muted text-xs mr-2">{cwdDisplay}</span>
            <span className="prompt-symbol mr-2 text-sm">❯</span>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-terminal-text text-sm font-mono outline-none caret-terminal-green placeholder:text-terminal-muted/50"
              placeholder="type a command..." autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
          </div>
        </div>
      )}
    </div>
  );
}
