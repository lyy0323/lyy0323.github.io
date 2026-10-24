import { useEffect, useState } from 'react';

type Mode = 'auto' | 'light' | 'dark';

const ORDER: Mode[] = ['auto', 'light', 'dark'];
const FACE: Record<Mode, string> = { auto: '◐', light: '☀', dark: '☾' };
const LABEL: Record<Mode, string> = { auto: '跟随系统', light: '亮色', dark: '暗色' };

/**
 * 三态主题切换：auto → light → dark 循环。
 * 真正的主题状态由 BaseLayout 里的内联脚本持有（window.__setTheme），
 * 这里只负责读它、显示图标、把点击转发过去。
 */
export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('auto');

  useEffect(() => {
    const sync = () => {
      const current = document.documentElement.dataset.themeMode as Mode | undefined;
      setMode(current && ORDER.includes(current) ? current : 'auto');
    };
    sync();
    window.addEventListener('theme-change', sync);
    return () => window.removeEventListener('theme-change', sync);
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    const set = (window as unknown as { __setTheme?: (m: Mode) => void }).__setTheme;
    if (set) set(next);
    else setMode(next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      title={`主题：${LABEL[mode]}（点击切换）`}
      aria-label={`当前主题：${LABEL[mode]}，点击切换`}
      className="fixed top-3 right-3 z-[9999] grid h-8 w-8 place-items-center rounded-md
        border border-terminal-border bg-terminal-surface/85 backdrop-blur-sm
        text-[13px] leading-none text-terminal-muted
        hover:text-terminal-green hover:border-terminal-green/40
        transition-colors duration-200 select-none"
    >
      {FACE[mode]}
    </button>
  );
}
