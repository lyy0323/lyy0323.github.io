import { useEffect, useRef, useState } from 'react';

interface Metric {
  value: number;
  suffix?: string;
  label: string;
  accent?: string;
}

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={ref}>{current.toLocaleString()}</span>;
}

export default function MetricCounter({ items }: { items: Metric[] }) {
  return (
    <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((m, i) => {
        const color = m.accent || 'green';
        return (
          <div key={i} className="rounded-lg border border-terminal-border bg-terminal-bg p-4 text-center">
            <div className={`text-2xl sm:text-3xl font-mono font-bold text-terminal-${color}`}>
              <AnimatedNumber target={m.value} />
              {m.suffix && <span className="text-lg">{m.suffix}</span>}
            </div>
            <div className="text-[10px] text-terminal-muted mt-1 font-lxgw">{m.label}</div>
          </div>
        );
      })}
    </div>
  );
}
