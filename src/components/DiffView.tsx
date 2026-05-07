import { useRef, useState, useEffect } from 'react';

interface Side {
  label: string;
  items: string[];
  accent?: string;
}

export default function DiffView({ before, after, verdict }: { before: Side; after: Side; verdict?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const accentBefore = before.accent || 'pink';
  const accentAfter = after.accent || 'green';
  const borderBefore = `border-terminal-${accentBefore}/40`;
  const borderAfter = `border-terminal-${accentAfter}/40`;

  return (
    <div ref={ref} className={`my-6 transition-all duration-600 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Before */}
        <div className={`rounded-lg border ${borderBefore} bg-terminal-bg p-4`}>
          <div className={`text-xs font-mono text-terminal-${accentBefore} mb-2 flex items-center gap-1.5`}>
            <span>−</span> {before.label}
          </div>
          <ul className="space-y-1.5">
            {before.items.map((item, i) => (
              <li key={i} className="text-xs text-terminal-muted font-lxgw flex items-start gap-1.5">
                <span className={`text-terminal-${accentBefore} shrink-0 mt-0.5`}>−</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* After */}
        <div className={`rounded-lg border ${borderAfter} bg-terminal-bg p-4`}>
          <div className={`text-xs font-mono text-terminal-${accentAfter} mb-2 flex items-center gap-1.5`}>
            <span>+</span> {after.label}
          </div>
          <ul className="space-y-1.5">
            {after.items.map((item, i) => (
              <li key={i} className="text-xs text-terminal-text font-lxgw flex items-start gap-1.5">
                <span className={`text-terminal-${accentAfter} shrink-0 mt-0.5`}>+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {verdict && (
        <div className="mt-3 text-xs text-terminal-muted font-lxgw text-center italic">
          {verdict}
        </div>
      )}
    </div>
  );
}
