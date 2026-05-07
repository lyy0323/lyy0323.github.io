import { useState, useMemo } from 'react';

interface GanttItem {
  label: string;
  start: string; // YYYY.MM
  end: string;   // YYYY.MM or 'now'
  kind: 'corp' | 'research' | 'community';
}

const ITEMS: GanttItem[] = [
  { label: 'MiniMax', start: '2026.02', end: 'now', kind: 'corp' },
  { label: '字节跳动', start: '2025.11', end: '2026.02', kind: 'corp' },
  { label: '蔚来能源', start: '2025.09', end: '2025.11', kind: 'corp' },
  { label: '科学学研究所', start: '2024.10', end: '2025.01', kind: 'corp' },
  { label: '知识竞争力中心', start: '2025.10', end: 'now', kind: 'research' },
  { label: '数管决策实验室', start: '2025.02', end: '2025.06', kind: 'research' },
  { label: '国学社', start: '2021.03', end: 'now', kind: 'community' },
];

const KIND_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  corp:      { bg: 'bg-terminal-cyan/15', border: 'border-terminal-cyan/40', text: 'text-terminal-cyan' },
  research:  { bg: 'bg-terminal-amber/15', border: 'border-terminal-amber/40', text: 'text-terminal-amber' },
  community: { bg: 'bg-terminal-pink/15', border: 'border-terminal-pink/40', text: 'text-terminal-pink' },
};

const KIND_LABELS: Record<string, string> = {
  corp: '企业',
  research: '研究',
  community: '社团',
};

const ROWS: ('corp' | 'research' | 'community')[] = ['corp', 'research', 'community'];

function parseMonth(s: string): number {
  if (s === 'now') {
    const d = new Date();
    return d.getFullYear() * 12 + (d.getMonth() + 1);
  }
  const [y, m] = s.split('.').map(Number);
  return y * 12 + m;
}

export default function CareerGantt() {
  const [hovered, setHovered] = useState<string | null>(null);

  const rangeStart = parseMonth('2024.09');
  const rangeEnd = parseMonth('now') + 1;
  const totalMonths = rangeEnd - rangeStart;

  const ticks = useMemo(() => {
    const t: { label: string; pos: number }[] = [];
    for (let m = rangeStart; m <= rangeEnd; m++) {
      const year = Math.floor((m - 1) / 12);
      const month = ((m - 1) % 12) + 1;
      if (month === 1 || month === 7 || m === rangeStart) {
        t.push({ label: `${year}.${String(month).padStart(2, '0')}`, pos: ((m - rangeStart) / totalMonths) * 100 });
      }
    }
    return t;
  }, [rangeStart, rangeEnd, totalMonths]);

  return (
    <div className="mb-6">
      <div className="mb-3">
        <span className="prompt-symbol">❯ </span>
        <span className="cmd-text">cat career.gantt</span>
      </div>

      {/* legend */}
      <div className="flex gap-4 mb-3 ml-2">
        {ROWS.map(kind => (
          <div key={kind} className="flex items-center gap-1.5 text-[10px]">
            <div className={`w-3 h-2 rounded-sm ${KIND_COLORS[kind].bg} border ${KIND_COLORS[kind].border}`} />
            <span className={KIND_COLORS[kind].text}>{KIND_LABELS[kind]}</span>
          </div>
        ))}
      </div>

      {/* chart */}
      <div className="relative ml-2 mr-2">
        {/* tick marks */}
        <div className="relative h-4 mb-1">
          {ticks.map((t, i) => (
            <div key={i} className="absolute text-[9px] text-terminal-muted" style={{ left: `${t.pos}%`, transform: 'translateX(-50%)' }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* rows */}
        {ROWS.map(kind => {
          const items = ITEMS.filter(it => it.kind === kind);
          const colors = KIND_COLORS[kind];
          return (
            <div key={kind} className="relative h-7 mb-1">
              {/* background track */}
              <div className="absolute inset-0 rounded bg-terminal-border/20" />
              {/* tick lines */}
              {ticks.map((t, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-terminal-border/30" style={{ left: `${t.pos}%` }} />
              ))}
              {/* bars */}
              {items.map((item, i) => {
                const s = parseMonth(item.start);
                const e = parseMonth(item.end);
                const left = ((s - rangeStart) / totalMonths) * 100;
                const width = ((e - s) / totalMonths) * 100;
                const isHovered = hovered === item.label;
                return (
                  <div
                    key={i}
                    className={`absolute top-1 bottom-1 rounded border transition-all duration-200
                      ${colors.bg} ${colors.border}
                      ${isHovered ? 'brightness-125 shadow-sm z-10' : ''}`}
                    style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%` }}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-lxgw truncate px-1
                      ${colors.text} ${width < 8 ? 'opacity-0' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* now marker */}
        <div className="absolute top-4 bottom-0 w-px bg-terminal-green/50 z-20"
          style={{ left: `${((parseMonth('now') - rangeStart) / totalMonths) * 100}%` }}>
          <div className="absolute -top-4 left-1 text-[8px] text-terminal-green">now</div>
        </div>
      </div>

      {/* hover tooltip */}
      {hovered && (
        <div className="mt-2 text-[10px] text-terminal-muted ml-2 animate-fade-in">
          {(() => {
            const item = ITEMS.find(it => it.label === hovered);
            if (!item) return null;
            return <span><span className={KIND_COLORS[item.kind].text}>{item.label}</span> · {item.start} → {item.end === 'now' ? 'present' : item.end}</span>;
          })()}
        </div>
      )}
    </div>
  );
}
