import { useEffect, useRef, useState } from 'react';

interface Milestone {
  date: string;
  title: string;
  desc?: string;
  accent?: string;
}

export default function Timeline({ items }: { items: Milestone[] }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="my-6 relative">
      {/* vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-terminal-border" />

      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={`relative pl-9 transition-all duration-500 ${
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {/* dot */}
            <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 ${
              item.accent === 'green' ? 'border-terminal-green bg-terminal-green/20' :
              item.accent === 'cyan' ? 'border-terminal-cyan bg-terminal-cyan/20' :
              item.accent === 'amber' ? 'border-terminal-amber bg-terminal-amber/20' :
              item.accent === 'pink' ? 'border-terminal-pink bg-terminal-pink/20' :
              'border-terminal-muted bg-terminal-muted/20'
            }`} />

            <div className="text-[10px] text-terminal-muted mb-0.5 font-mono">{item.date}</div>
            <div className="text-sm text-terminal-text font-lxgw font-semibold">{item.title}</div>
            {item.desc && (
              <div className="text-xs text-terminal-muted font-lxgw mt-0.5 leading-relaxed">{item.desc}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
