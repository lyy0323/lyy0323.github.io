import { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

interface GanttItem {
  label: string;
  start: string; // YYYY.MM 或 YYYY.MM.DD
  end: string;   // 同上，或 'now'
  kind: 'corp' | 'research' | 'community';
}

const ITEMS: GanttItem[] = [
  { label: '字节跳动', start: '2026.10.14', end: 'now', kind: 'corp' },
  { label: 'MiniMax', start: '2026.02', end: '2026.08.14', kind: 'corp' },
  { label: '字节跳动 Seedream', start: '2025.11', end: '2026.02', kind: 'corp' },
  { label: '蔚来能源', start: '2025.09', end: '2025.11', kind: 'corp' },
  { label: '科学学研究所', start: '2024.10', end: '2025.01', kind: 'corp' },
  { label: '知识竞争力中心', start: '2025.10', end: 'now', kind: 'research' },
  { label: '数管决策实验室', start: '2025.02', end: '2025.06', kind: 'research' },
  { label: '国学社', start: '2021.03', end: 'now', kind: 'community' },
];

/** 时间轴最左端：再往前滚不动 */
const RANGE_FLOOR = '2024.09';
/** 默认视窗宽度（月）。用户可横向滚动，窗宽不变 */
const VIEW_MONTHS = 18;

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

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate(); // m 为 1-based，Day 0 即当月最后一天
}

/** 把 'YYYY.MM' / 'YYYY.MM.DD' / 'now' 折算成连续月数，日按当月天数取小数 */
function toMonths(input: string): number {
  if (input === 'now') {
    const now = new Date();
    const m = now.getMonth() + 1;
    return now.getFullYear() * 12 + (m - 1) + (now.getDate() - 1) / daysInMonth(now.getFullYear(), m);
  }
  const [y, m, d = 1] = input.split('.').map(Number);
  return y * 12 + (m - 1) + (d - 1) / daysInMonth(y, m);
}

export default function CareerGantt() {
  const [hovered, setHovered] = useState<string | null>(null);
  // 默认停在最右侧（最近 VIEW_MONTHS 个月），所以「到末尾」的初始态就是 true
  const [atStart, setAtStart] = useState(false);
  const [atEnd, setAtEnd] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pinsToEnd = useRef(true);

  const { rangeStart, totalMonths, ticks, nowPos } = useMemo(() => {
    const rangeStart = toMonths(RANGE_FLOOR);
    const now = toMonths('now');
    const rangeEnd = now + 0.5; // 右侧留半个月，今天的 bar 不顶到边上
    const totalMonths = rangeEnd - rangeStart;

    const ticks: { key: string; label: string | null; pos: number; major: boolean }[] = [];
    for (let m = Math.ceil(rangeStart); m <= Math.floor(rangeEnd); m++) {
      const y = Math.floor(m / 12);
      const mo = (m % 12) + 1;
      const major = mo === 1 || mo === 7;
      const isFirst = m === Math.ceil(rangeStart);
      ticks.push({
        key: `${y}-${mo}`,
        // Jan / Jul 出标签，首月也标一下，免得左边界没有参照
        label: major || isFirst ? `${y}.${String(mo).padStart(2, '0')}` : null,
        pos: ((m - rangeStart) / totalMonths) * 100,
        major,
      });
    }
    return { rangeStart, totalMonths, ticks, nowPos: ((now - rangeStart) / totalMonths) * 100 };
  }, []);

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const nearStart = el.scrollLeft <= 1;
    const nearEnd = el.scrollLeft >= max - 1;
    pinsToEnd.current = nearEnd;
    setAtStart(nearStart);
    setAtEnd(nearEnd);
  }, []);

  // SSR 阶段没有 window，退回 useEffect；客户端用 layout effect 保证首帧前就定位到最右
  const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // 默认停在最右侧：视窗 = 最近 VIEW_MONTHS 个月
  useIsoLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
    syncEdges();

    // 宽度变化（旋转屏幕 / 拉伸窗口）后 px 位置会失效：本来贴着右端就继续贴着
    const onResize = () => {
      if (pinsToEnd.current) el.scrollLeft = el.scrollWidth;
      syncEdges();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [syncEdges]);

  const scrollByMonths = useCallback((n: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: (el.scrollWidth / totalMonths) * n, behavior: 'smooth' });
  }, [totalMonths]);

  const navBtn = 'w-5 h-5 grid place-items-center rounded border border-terminal-border text-[10px] ' +
    'text-terminal-muted transition-colors duration-200 enabled:hover:text-terminal-green ' +
    'enabled:hover:border-terminal-green/40 disabled:opacity-25 disabled:cursor-default';

  return (
    <div className="mb-6">
      <div className="mb-3">
        <span className="prompt-symbol">❯ </span>
        <span className="cmd-text">cat career.gantt</span>
      </div>

      {/* legend + 滚动按钮 */}
      <div className="flex items-center justify-between gap-3 mb-3 ml-2 mr-2">
        <div className="flex gap-4">
          {ROWS.map(kind => (
            <div key={kind} className="flex items-center gap-1.5 text-[10px]">
              <div className={`w-3 h-2 rounded-sm ${KIND_COLORS[kind].bg} border ${KIND_COLORS[kind].border}`} />
              <span className={KIND_COLORS[kind].text}>{KIND_LABELS[kind]}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={navBtn} disabled={atStart}
            onClick={() => scrollByMonths(-6)} aria-label="向前滚动 6 个月" title="向前 6 个月">‹</button>
          <button type="button" className={navBtn} disabled={atEnd}
            onClick={() => scrollByMonths(6)} aria-label="向后滚动 6 个月" title="向后 6 个月">›</button>
        </div>
      </div>

      {/* 可横向滚动的画布：内容宽 = totalMonths / VIEW_MONTHS，因此一屏恰好 VIEW_MONTHS 个月 */}
      <div
        ref={scrollerRef}
        onScroll={syncEdges}
        className="ml-2 mr-2 overflow-x-auto overscroll-x-contain pb-1"
      >
        <div className="relative" style={{ width: `${(totalMonths / VIEW_MONTHS) * 100}%` }}>
          {/* 刻度 */}
          <div className="relative h-4 mb-1">
            {ticks.filter(t => t.label).map(t => (
              <div
                key={t.key}
                className="absolute text-[9px] text-terminal-muted whitespace-nowrap"
                style={{
                  left: `${t.pos}%`,
                  transform: t.pos < 3 ? 'none' : t.pos > 97 ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                {t.label}
              </div>
            ))}
          </div>

          {/* 各行 */}
          {ROWS.map(kind => {
            const items = ITEMS.filter(it => it.kind === kind);
            const colors = KIND_COLORS[kind];
            return (
              <div key={kind} className="relative h-7 mb-1">
                {/* 底轨 */}
                <div className="absolute inset-0 rounded bg-terminal-border/20" />
                {/* 网格线：每月一条，1 月 / 7 月加重 */}
                {ticks.map(t => (
                  <div key={t.key} className={`absolute top-0 bottom-0 w-px ${t.major ? 'bg-terminal-border/45' : 'bg-terminal-border/20'}`}
                    style={{ left: `${t.pos}%` }} />
                ))}
                {/* 条形 */}
                {items.map((item) => {
                  const trueStart = toMonths(item.start);
                  const trueEnd = Math.min(toMonths(item.end), rangeStart + totalMonths);
                  const s = Math.max(trueStart, rangeStart);
                  const left = ((s - rangeStart) / totalMonths) * 100;
                  const width = ((trueEnd - s) / totalMonths) * 100;
                  const isHovered = hovered === item.label;
                  const tooNarrow = trueEnd - s < 2;
                  return (
                    <div
                      key={item.label}
                      className={`absolute top-1 bottom-1 rounded border transition-all duration-200
                        ${colors.bg} ${colors.border}
                        ${isHovered ? 'brightness-125 shadow-sm z-10' : ''}
                        ${trueStart < rangeStart ? 'rounded-l-none border-l-0' : ''}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      onMouseEnter={() => setHovered(item.label)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* 外层负责裁剪：flex 容器自身不一定截断，交给里面的 span 做 truncate */}
                      <span className={`absolute inset-0 overflow-hidden flex items-center justify-center px-1
                        ${colors.text} ${tooNarrow ? 'invisible' : ''}`}>
                        <span className="truncate text-[9px] font-lxgw">
                          {trueStart < rangeStart ? `◀ ${item.label}` : item.label}
                        </span>
                      </span>
                      {/* 太短的条形（例如刚入职十天）标签放不下，挪到左外侧，靠 hover 之外的路径也能读到 */}
                      {tooNarrow && (
                        <span className={`absolute top-1/2 -translate-y-1/2 right-full mr-1.5 text-[9px] font-lxgw whitespace-nowrap ${colors.text}`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* now 竖线 */}
          <div className="absolute top-4 bottom-0 w-px bg-terminal-green/50 z-20" style={{ left: `${nowPos}%` }}>
            <div className="absolute -top-4 left-1 text-[8px] text-terminal-green">now</div>
          </div>
        </div>
      </div>

      {/* hover 详情 */}
      {hovered && (
        <div className="mt-2 text-[10px] text-terminal-muted ml-2 animate-fade-in">
          {(() => {
            const item = ITEMS.find(it => it.label === hovered);
            if (!item) return null;
            return (
              <span>
                <span className={KIND_COLORS[item.kind].text}>{item.label}</span>
                {' · '}{item.start} → {item.end === 'now' ? 'present' : item.end}
              </span>
            );
          })()}
        </div>
      )}

      <div className="mt-1.5 ml-2 text-[9px] text-terminal-muted">
        ← 横向滚动查看更早 · 最远到 {RANGE_FLOOR} · 一屏 {VIEW_MONTHS} 个月
      </div>
    </div>
  );
}
