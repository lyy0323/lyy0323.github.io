import { useRef, useEffect, useState } from 'react';
import CareerGantt from './CareerGantt';

// ── shared data types ──

interface ManSection { heading: string; lines: string[] }
interface ExpandableItem { org: string; role: string; period: string; manPage: ManSection[]; kind?: 'corp' | 'research' | 'community' }
interface SimpleItem { label: string; detail?: string }

// ── career ──

const career: ExpandableItem[] = [
  {
    org: 'MiniMax', role: '视觉产品组 · Talkie/星野', period: '2026.02 → present', kind: 'corp',
    manPage: [
      { heading: 'NAME', lines: ['MiniMax — 视觉产品组 · Talkie/星野'] },
      { heading: 'SYNOPSIS', lines: ['minimax --role "PM" --team "visual" --since 2026.02'] },
      { heading: 'DESCRIPTION', lines: ['Talkie/星野卡牌体系重构。', '（详细内容待补充）'] },
    ],
  },
  {
    org: '字节跳动 Seedream', role: 'AI PM · 生图模型评测', period: '2025.11 → 2026.02', kind: 'corp',
    manPage: [
      { heading: 'NAME', lines: ['字节跳动 Seedream — AI PM · 生图模型后训练方向'] },
      { heading: 'SYNOPSIS', lines: ['seedream --role "AI PM" --period 2025.11~2026.02'] },
      { heading: 'DESCRIPTION', lines: ['设计四层树状结构的生图模型评估框架，将推理能力和生成质量拆成独立评估线。', '用 Shifted Harmonic Mean 做聚合算分，让单一硬伤无法被高分掩盖。', '方案未被采纳——后来团队上线 reasoning DiT 模型时美学质量严重下滑，翻在了我试图监控的维度上。', '另负责用户反馈数据分析与看板建设。'] },
      { heading: 'SEE ALSO', lines: ['/tech/blog/rethinking-t2i-evaluation/'] },
    ],
  },
  {
    org: '蔚来能源', role: 'AI 产品经理', period: '2025.09 → 2025.11', kind: 'corp',
    manPage: [
      { heading: 'NAME', lines: ['蔚来能源 — AI 产品经理'] },
      { heading: 'SYNOPSIS', lines: ['nio-energy --role "AI PM" --period 2025.09~2025.11'] },
      { heading: 'DESCRIPTION', lines: ['优化面向销售渠道的 AI Agent：接手时问答准确率 15%，诊断为知识库质量问题。', '重构知识库：拆为"服务诀窍 QA" + "产品事实 JSON"双轨。', '准确率从 15% 提升到 80%。', '主导部门数据治理：统一三张分散表的数据源，搭建自动化看板。'] },
      { heading: 'SEE ALSO', lines: ['/tech/blog/nio-energy-ai-pm/'] },
    ],
  },
  {
    org: '上海市知识竞争力与区域发展研究中心', role: '研究员（横向）', period: '2025.10 → present', kind: 'research',
    manPage: [
      { heading: 'NAME', lines: ['上海市知识竞争力与区域发展研究中心 — 研究员（横向）'] },
      { heading: 'DESCRIPTION', lines: ['智库研究与政策咨询 — AI 方向。', '《前沿领域动态》内参"人工智能"板块首席撰稿人，每月编译全球 AI 产业关键事件。', '参与区域创新能力评估、AI 产业政策研究等横向课题。'] },
      { heading: 'SEE ALSO', lines: ['/tech/blog/ai-frontier-dynamics/'] },
    ],
  },
  {
    org: '上海交大"数字化管理决策"实验室', role: '助管 · 软件授权平台 PM', period: '2025.02 → 2025.06', kind: 'research',
    manPage: [
      { heading: 'NAME', lines: ['上海交通大学"数字化管理决策"实验室 — 助管'] },
      { heading: 'DESCRIPTION', lines: ['实验室软件授权平台产品经理', '撰写 PRD 并与外包开发人员对接，将微信小程序功能迁移到 H5', '把控鉴权系统设计，解决"同一人不同身份"引起的历史遗留问题'] },
    ],
  },
  {
    org: '上海市科学学研究所', role: '实习 · 行业研究', period: '2024.10 → 2025.01', kind: 'corp',
    manPage: [
      { heading: 'NAME', lines: ['上海市科学学研究所 — 实习'] },
      { heading: 'DESCRIPTION', lines: ['科学学研究 — 科技前沿研究方向', '覆盖领域：AI、脑机接口、具身智能、内窥镜等', '撰写科学学报告和内参文件约 30 万字'] },
    ],
  },
  {
    org: '上海交通大学国学社', role: '社长 → 技术部创始人', period: '2021 → present', kind: 'community',
    manPage: [
      { heading: 'NAME', lines: ['上海交通大学国学社 — 将其建设为上海高校第一诗社的功勋人物'] },
      { heading: 'ROLES', lines: ['社长                    2021.09 ~ 2022.08', '乐府部创始人             2021.12', '技术部创始人             2025.09', '文韵部骨干成员           2021.03 ~ 至今'] },
      { heading: 'DESCRIPTION', lines: ['社员诗歌网站 PM (190w+ 访问)，社团数字化转型带头人', '"灵枢" 智能知识中枢与决策辅助 Agent 全栈开发', '第六届上海高校国学挑战赛总策划、总导演，规模较往届扩大 180%', '从无到有策划线上活动，推出"一日一诗"打卡，为校园近 3000 人次提供陪伴', '《南洋集》册七责编，《南洋精选集》首席编辑'] },
      { heading: 'SEE ALSO', lines: [
        '/tech/projects/poem-site/',
        '/tech/projects/lingshu/',
        '/tech/projects/ai-poetry/',
        '/tech/projects/poem-analytics/',
        '/tech/projects/neo-classic/',
        '/tech/projects/fangcun/',
        '/tech/projects/nfc-collectibles/',
        '/tech/projects/yuefu-anniv/',
      ] },
    ],
  },
];

// ── education ──

const education: ExpandableItem[] = [
  {
    org: '上海交通大学', role: '硕士 · 应用经济学', period: '2024.09 → 2027.03(预)',
    manPage: [
      { heading: 'NAME', lines: ['上海交通大学 安泰经济与管理学院 — 在读硕士研究生'] },
      { heading: 'DESCRIPTION', lines: ['应用经济学 — 科学学研究 — 人工智能 (AI SciSci)', '导师：罗守贵', '上海市软科学研究基地研究员', '《前沿领域动态》内参"人工智能"板块首席撰稿人'] },
    ],
  },
  {
    org: '上海交通大学', role: '学士 · 经济学 + 大数据管理与应用', period: '2020.09 → 2024.06',
    manPage: [
      { heading: 'NAME', lines: ['上海交通大学 安泰经济与管理学院 — 学士'] },
      { heading: 'DESCRIPTION', lines: ['经济学 + 大数据管理与应用（信息管理与信息系统）', 'Score: 87.33/100', '对标数学系的数学课程体系培养'] },
      { heading: 'HIGHLIGHTS', lines: ['满绩：应用计量经济学、程序设计 (Python)、数据采集和可视化、建模与优化、商务统计学', '90+：心理与行为、博弈论、MATLAB 编程与建模、组织行为学、金融学原理、线性代数'] },
    ],
  },
  {
    org: '上海市延安中学', role: '高中', period: '2017.09 → 2020.07',
    manPage: [
      { heading: 'NAME', lines: ['上海市延安中学'] },
      { heading: 'DESCRIPTION', lines: ['小三门选考：物理 / 化学 / 地理', '任班长，首创班刊并任总策划，成书四册', '2020 年校高考状元'] },
    ],
  },
];

// ── publication ──

const publications: { label: string; detail: string; href?: string }[] = [
  { label: 'Neo-Classic: Deconstructing the Memorization Illusion in LLMs via a Contamination-Free Poetry Benchmark', detail: 'ACL 2026 Main · 第一作者', href: '/tech/projects/neo-classic/' },
  { label: 'Deconstructing Positional Information: From Attention Logits to Training Biases', detail: 'ICLR 2026 Main', href: 'https://arxiv.org/abs/2505.13027' },
];

// ── interests ──

const interests = [
  { name: '诗词', color: 'text-terminal-pink' },
  { name: '音乐创作', color: 'text-terminal-amber' },
  { name: 'Python', color: 'text-terminal-green' },
  { name: '语言学', color: 'text-terminal-cyan' },
  { name: '数字人文', color: 'text-terminal-purple' },
  { name: '荣格心理学', color: 'text-terminal-pink' },
  { name: '酷儿理论', color: 'text-terminal-cyan' },
  { name: '文创设计', color: 'text-terminal-amber' },
];

// ── man page view ──

function ManPageView({ item, onClose }: { item: ExpandableItem; onClose: () => void }) {
  return (
    <div className="mt-3 animate-fade-in">
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="ml-3 text-xs text-terminal-muted">
            man {item.org.split(' ')[0].toLowerCase()}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="ml-auto text-xs text-terminal-muted hover:text-terminal-text transition-colors px-1"
          >
            [q]uit
          </button>
        </div>
        <div className="p-4 sm:p-5 text-xs sm:text-sm space-y-4 max-h-[50vh] overflow-y-auto">
          {item.manPage.map((section, i) => (
            <div key={i}>
              <div className="text-terminal-amber font-bold mb-1.5">{section.heading}</div>
              <div className="ml-4 sm:ml-6 space-y-1">
                {section.lines.map((line, j) => (
                  <div key={j} className="text-terminal-text font-lxgw leading-relaxed">
                    {section.heading === 'SYNOPSIS' ? (
                      <span className="text-terminal-green text-xs">{line}</span>
                    ) : section.heading === 'SEE ALSO' ? (
                      <a href={line} className="link-glow text-sm">{line}</a>
                    ) : section.heading === 'ROLES' || section.heading === 'HIGHLIGHTS' ? (
                      <pre className="text-terminal-text text-xs whitespace-pre-wrap">{line}</pre>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-terminal-border text-terminal-muted text-[10px]">
            {item.org}({item.period}) — lyy0323.space
          </div>
        </div>
      </div>
    </div>
  );
}

// ── expandable list section ──

const kindColors: Record<string, string> = {
  corp: 'text-terminal-cyan',
  research: 'text-terminal-amber',
  community: 'text-terminal-pink',
};

const kindBorderActive: Record<string, string> = {
  corp: 'border-terminal-cyan/80',
  research: 'border-terminal-amber/80',
  community: 'border-terminal-pink/80',
};

const kindBorderHover: Record<string, string> = {
  corp: 'hover:border-terminal-cyan/60',
  research: 'hover:border-terminal-amber/60',
  community: 'hover:border-terminal-pink/60',
};

function ExpandableSection({ cmd, items }: { cmd: string; items: ExpandableItem[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  return (
    <div className="mb-6">
      <div className="mb-3">
        <span className="prompt-symbol">❯ </span>
        <span className="cmd-text">{cmd}</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const kind = item.kind || 'corp';
          const orgColor = kindColors[kind];
          const borderActive = kindBorderActive[kind];
          const borderHover = kindBorderHover[kind];
          return (
          <div key={i}>
            <div
              className={`group pl-2 border-l-2 transition-all duration-300 cursor-pointer
                ${expandedIdx === i ? borderActive : `border-terminal-border ${borderHover}`}`}
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] transition-transform duration-200
                    ${expandedIdx === i ? `rotate-90 ${orgColor}` : 'text-terminal-muted'}`}>▶</span>
                  <div>
                    <span className={`${orgColor} text-sm font-semibold font-lxgw`}>{item.org}</span>
                    <span className="text-xs text-terminal-muted font-lxgw ml-2">{item.role}</span>
                  </div>
                </div>
                <div className="text-xs text-terminal-muted whitespace-nowrap shrink-0 ml-6 sm:ml-0">{item.period}</div>
              </div>
            </div>
            {expandedIdx === i && <ManPageView item={item} onClose={() => setExpandedIdx(null)} />}
          </div>
          );
        })}
      </div>
      {expandedIdx === null && (
        <div className="mt-3 text-[10px] text-terminal-muted ml-2">
          click to <span className="text-terminal-cyan">man</span> any entry
        </div>
      )}
    </div>
  );
}

// ── main component ──

export default function AboutSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 delay-200
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="terminal-window max-w-3xl w-full mx-auto">
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="ml-3 text-xs text-terminal-muted">about.md</span>
        </div>
        <div className="p-5 sm:p-6">

          {/* Identity */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="prompt-symbol">❯ </span>
              <span className="cmd-text">grep identity about.md</span>
            </div>
            <div className="pl-2 border-l-2 border-terminal-green/30">
              <div className="text-terminal-amber font-semibold mb-2">## Identity</div>
              <div className="text-sm text-terminal-text ml-2 space-y-1.5">
                <div className="space-y-0.5">
                  <div>
                    <span className="text-terminal-muted">name:</span>{' '}
                    <span className="text-terminal-muted text-xs">(preferred)</span>{' '}
                    林雨夜 | Yuye[y'jɛ:] | 芋椰 | 椰椰 | Coco
                  </div>
                  <div className="ml-[3.4em]">
                    <span className="text-terminal-muted text-xs">(assigned)</span>{' '}
                    <span className="text-terminal-text/70">张　含 | Han Zhang</span>
                  </div>
                </div>
                <div>
                  <span className="text-terminal-muted">type:</span>{' '}
                  <span className="text-terminal-pink">INTJ</span>{' '}
                  <span className="text-terminal-muted text-xs">4w5 · 415 · sx/so · EII</span>
                </div>
                <div>
                  <span className="text-terminal-muted">location:</span> 上海 Shanghai
                </div>
              </div>
            </div>
          </div>

          {/* Career */}
          <ExpandableSection cmd="grep career about.md" items={career} />

          {/* Career Gantt */}
          <CareerGantt />

          {/* Education */}
          <ExpandableSection cmd="grep education about.md" items={education} />

          {/* Publication */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="prompt-symbol">❯ </span>
              <span className="cmd-text">grep publication about.md</span>
            </div>
            <div className="pl-2 border-l-2 border-terminal-green/30">
              <div className="text-terminal-amber font-semibold mb-2">## Publication</div>
              <div className="ml-2 space-y-2">
                {publications.map((p, i) => (
                  <div key={i}>
                    {p.href ? (
                      <a href={p.href} className="text-sm text-terminal-text font-lxgw link-glow"
                        target={p.href.startsWith('http') ? '_blank' : undefined}
                        rel={p.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                        {p.label}
                      </a>
                    ) : (
                      <div className="text-sm text-terminal-text font-lxgw">{p.label}</div>
                    )}
                    {p.detail && <div className="text-xs text-terminal-muted">{p.detail}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="prompt-symbol">❯ </span>
              <span className="cmd-text">grep interests about.md</span>
            </div>
            <div className="flex flex-wrap gap-2 ml-2">
              {interests.map((s, i) => (
                <span key={i}
                  className={`text-xs px-2 py-1 rounded border border-terminal-border
                    hover:border-terminal-green/40 transition-all duration-200
                    bg-terminal-bg ${s.color} cursor-default font-lxgw`}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="pt-4 border-t border-terminal-border">
            <div className="mb-3">
              <span className="prompt-symbol">❯ </span>
              <span className="cmd-text">grep social about.md</span>
            </div>
            <div className="ml-2 space-y-1.5 text-sm">
              <div>
                <span className="text-terminal-muted">xiaohongshu:</span>{' '}
                <span className="text-terminal-text font-lxgw">@芋泥椰子冻</span>
              </div>
              <div>
                <span className="text-terminal-muted">netease_music:</span>{' '}
                <span className="text-terminal-text font-lxgw">@林雨夜 (歌手)</span>
              </div>
              <div>
                <span className="text-terminal-muted">github:</span>{' '}
                <a href="https://github.com/lyy0323" className="link-glow" target="_blank" rel="noopener noreferrer">@lyy0323</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
