import { useState, useEffect, useRef } from 'react';

interface TerminalLine {
  type: 'prompt' | 'output' | 'blank';
  content?: string;
  delay?: number;
  className?: string;
}

const BOOT_SEQUENCE: TerminalLine[] = [
  { type: 'prompt', content: 'ssh yuye@lyy0323.space', delay: 600 },
  { type: 'output', content: 'Connecting to lyy0323.space...', className: 'text-terminal-muted', delay: 800 },
  { type: 'output', content: 'Connection established. Welcome back.', className: 'text-terminal-green', delay: 400 },
  { type: 'blank', delay: 300 },
  { type: 'prompt', content: 'whoami', delay: 500 },
  { type: 'output', content: 'name: (preferred) 林雨夜 | Yuye[y\'jɛ:] | 芋椰 | 椰椰 | Coco', className: 'text-terminal-text text-sm', delay: 100 },
  { type: 'output', content: '       (assigned) 张　含 | Han Zhang', className: 'text-terminal-text/70 text-sm', delay: 100 },
  { type: 'output', content: 'type: INTJ · 4w5 · 415 · sx/so · EII', className: 'text-terminal-text text-sm', delay: 100 },
  { type: 'output', content: 'location: 上海 Shanghai', className: 'text-terminal-text text-sm', delay: 100 },
  { type: 'blank', delay: 400 },
  { type: 'prompt', content: 'cat motto.txt', delay: 500 },
  { type: 'output', content: '「至此春温能想象，从来寒夜可倾怀。」', className: 'text-terminal-pink font-lxgw text-lg', delay: 100 },
  { type: 'blank', delay: 500 },
];

export default function TerminalHero() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typing, setTyping] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [bootDone, setBootDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIdx >= BOOT_SEQUENCE.length) {
      setBootDone(true);
      return;
    }

    const line = BOOT_SEQUENCE[currentIdx];

    if (line.type === 'prompt') {
      let charIdx = 0;
      setTyping('');
      const typeInterval = setInterval(() => {
        if (charIdx < (line.content?.length ?? 0)) {
          setTyping(line.content!.slice(0, charIdx + 1));
          charIdx++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setLines(prev => [...prev, line]);
            setTyping('');
            setCurrentIdx(i => i + 1);
          }, 200);
        }
      }, 40);
      return () => clearInterval(typeInterval);
    } else {
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, line]);
        setCurrentIdx(i => i + 1);
      }, line.delay ?? 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIdx]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, typing]);

  return (
    <div className="terminal-window max-w-3xl w-full mx-auto">
      <div className="terminal-header">
        <div className="terminal-dot bg-red-500" />
        <div className="terminal-dot bg-yellow-500" />
        <div className="terminal-dot bg-green-500" />
        <span className="ml-3 text-xs text-terminal-muted">yuye@lyy0323.space — zsh</span>
      </div>
      <div ref={containerRef} className="p-5 sm:p-6 min-h-[320px] max-h-[60vh] overflow-y-auto">
        {lines.map((line, i) => (
          <div key={i} className={`${line.type === 'blank' ? 'h-4' : 'mb-1'}`}>
            {line.type === 'prompt' && (
              <span>
                <span className="prompt-symbol">❯ </span>
                <span className="cmd-text">{line.content}</span>
              </span>
            )}
            {line.type === 'output' && (
              <span className={`ml-2 ${line.className ?? 'output-text'}`}>
                {line.content}
              </span>
            )}
          </div>
        ))}

        {!bootDone && typing !== '' && (
          <div className="mb-1">
            <span className="prompt-symbol">❯ </span>
            <span className="cmd-text">{typing}</span>
            <span className={`inline-block w-2 h-5 bg-terminal-green ml-0.5 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}
                  style={{ animation: 'blink 1s step-end infinite' }} />
          </div>
        )}

        {bootDone && (
          <div className="mb-1 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-terminal'))}>
            <span className="prompt-symbol">❯ </span>
            <span className={`inline-block w-2 h-5 bg-terminal-green ml-0.5 align-middle`}
                  style={{ animation: 'blink 1s step-end infinite' }} />
          </div>
        )}
      </div>
    </div>
  );
}
