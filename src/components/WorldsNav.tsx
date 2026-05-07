import { useState, useRef, useEffect, useMemo } from 'react';

interface World {
  name: string;
  path: string;
  icon: string;
  desc: string;
  color: string;
  status: 'live' | 'wip' | 'building';
  statusText?: string;
  disabled?: boolean;
}

function getImageProgress(): { ok: number; total: number } {
  const baseDate = new Date('2026-05-07T00:00:00+08:00').getTime();
  const now = Date.now();
  const daysSince = Math.floor((now - baseDate) / 86400000);
  const ok = 28701 + daysSince * 144;
  const total = 134492 + daysSince * 24;
  return { ok, total };
}

const baseWorlds: Omit<World, 'statusText'>[] = [
  {
    name: 'writing',
    path: '/writing/',
    icon: '✍️',
    desc: '诗歌 · 散文 · 音乐 · 生活感悟',
    color: 'text-terminal-pink',
    status: 'live',
  },
  {
    name: 'geo',
    path: '/geo/',
    icon: '🌍',
    desc: '旅行 · 交通 · 摄影 · 城市',
    color: 'text-terminal-cyan',
    status: 'building',
    disabled: true,
  },
  {
    name: 'tech',
    path: '/tech/',
    icon: '💻',
    desc: '数字产品 · 网站 · App · 数据分析',
    color: 'text-terminal-green',
    status: 'live',
  },
  {
    name: 'image',
    path: 'https://img.lyy0323.space',
    icon: '📷',
    desc: '相册 · 摄影 · 生活记录',
    color: 'text-terminal-amber',
    status: 'building',
    disabled: true,
  },
];

export default function WorldsNav() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const imgProgress = useMemo(() => getImageProgress(), []);

  const worlds: World[] = useMemo(() => baseWorlds.map(w => {
    if (w.name === 'geo') return { ...w, statusText: '施工中……预计 2027 年开通' };
    if (w.name === 'image') return { ...w, statusText: `图像传输中……${imgProgress.ok} / ${imgProgress.total}` };
    return w as World;
  }), [imgProgress]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="terminal-window max-w-3xl w-full mx-auto">
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="ml-3 text-xs text-terminal-muted">explorer</span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="mb-4">
            <span className="prompt-symbol">❯ </span>
            <span className="cmd-text">ls worlds/</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {worlds.map((w, i) => {
              const Tag = w.disabled ? 'div' : 'a';
              return (
                <Tag
                  key={w.name}
                  {...(!w.disabled ? { href: w.path } : {})}
                  className={`group relative block p-5 rounded-lg border border-terminal-border
                    bg-terminal-bg transition-all duration-300
                    ${w.disabled
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:bg-terminal-surface hover:border-terminal-green/40 hover:shadow-[0_0_20px_rgba(85,153,119,0.08)]'}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                  onMouseEnter={() => setHovered(w.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="text-2xl mb-2">{w.icon}</div>
                  <div className={`font-semibold mb-1 ${w.color} ${!w.disabled ? 'group-hover:animate-glow' : ''}`}>
                    {w.name}/
                  </div>
                  <div className="text-xs text-terminal-muted font-lxgw leading-relaxed">
                    {w.desc}
                  </div>

                  {/* status badge */}
                  <div className={`absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded
                    ${w.status === 'live'
                      ? 'bg-terminal-green/10 text-terminal-green'
                      : 'bg-terminal-amber/10 text-terminal-amber'}`}>
                    {w.status === 'live' ? '● live' : '◌ building'}
                  </div>

                  {/* building status text */}
                  {w.statusText && (
                    <div className="mt-2 text-[10px] text-terminal-amber/70 font-lxgw">
                      {w.statusText}
                    </div>
                  )}

                  {hovered === w.name && !w.disabled && (
                    <div className="absolute inset-0 rounded-lg pointer-events-none"
                         style={{
                           background: 'radial-gradient(circle at 50% 50%, rgba(85,153,119,0.04), transparent 70%)',
                         }} />
                  )}
                </Tag>
              );
            })}
          </div>

          {hovered && !worlds.find(w => w.name === hovered)?.disabled && (
            <div className="mt-4 text-sm text-terminal-muted transition-opacity duration-200">
              <span className="prompt-symbol">❯ </span>
              <span className="cmd-text">cd worlds/{hovered} && open .</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
